import {ModelBase} from "../models/model.base";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Paris} from "../services/paris";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {DataQuery} from "../dataset/data-query";
import {combineLatest, Observable, of} from "rxjs";
import {DataSet} from "../dataset/dataset";
import {ReadonlyRepository} from "./readonly-repository";
import {map} from "rxjs/operators";
import {valueObjectsService} from "../services/value-objects.service";
import {EntityConfigBase, ModelConfig} from "../entity/entity-config.base";
import {ModelEntity} from "../entity/entity.config";
import {FIELD_DATA_SELF} from "../entity/entity-field.config";
import {get} from "lodash-es";
import {DataTransformersService} from "../services/data-transformers.service";
import {Field} from "../entity/entity-field";
import {EntityModelBase} from "../models/entity-model.base";
import {Index} from "../models";

const DEFAULT_ALL_ITEMS_PROPERTY = 'items';

export class Modeler {
	constructor(private paris:Paris){}

	/**
	 * Populates the item dataset with any sub-model. For example, if an ID is found for a property whose type is an entity,
	 * the property's value will be an instance of that entity, for the ID, not the ID.
	 * This method does the actual heavy lifting required for modeling an Entity or ValueObject - parses the fields, models sub-models, etc.
	 *
	 * @template TEntity The entity to model
	 * @template TRawData The raw data
	 * @template TConcreteEntity An optional entity derived from `TEntity` that will be used if `TEntity` uses `modelWith`
	 * @param {TRawData} rawData
	 * @param {ModelConfig<TEntity, TRawData>} entity
	 * @param {DataOptions} [options=defaultDataOptions]
	 * @param {DataQuery} [query]
	 * @returns {Observable<TEntity> | Observable<TConcreteEntity>}
	 */
	modelEntity<TEntity extends ModelBase, TRawData extends any = any, TConcreteEntity extends TEntity = TEntity>(rawData: TRawData, entity: ModelConfig<TEntity, TRawData>, options: DataOptions = defaultDataOptions, query?: DataQuery) : Observable<TEntity> {
		let entityIdProperty: keyof TRawData = entity.idProperty || this.paris.config.entityIdProperty,
			modelData: Index = entity instanceof ModelEntity ? {id: rawData[entityIdProperty]} : {},
			subModels: Array<Observable<{ [index: string]: ModelBase | Array<ModelBase> }>> = [];

		let getModelDataError:Error = new Error(`Failed to create ${entity.singularName}.`);

		if (typeof entity.modelWith === 'function') {
			const { entityConfig, valueObjectConfig } = entity.modelWith(rawData);
			return this.modelEntity<TConcreteEntity, TRawData>(
				rawData,
				entityConfig || valueObjectConfig,
				options
			);
		}

		entity.fields.forEach((entityField: Field) => {
			if (!this.validateFieldData(entityField, rawData)){
				modelData[entityField.id] = null;
				return;
			}

			let entityFieldRawData: any = Modeler.getFieldRawData<TRawData>(entityField, rawData);

			if (entityField.parse) {
				try {
					entityFieldRawData = entityField.parse(entityFieldRawData, rawData, query);
				}
				catch(e){
					getModelDataError.message = getModelDataError.message + ` Error parsing field ${entityField.id}: ` + e.message;
					throw getModelDataError;
				}
			}
			if (entityFieldRawData === undefined || entityFieldRawData === null) {
				let fieldRepository:ReadonlyRepository<EntityModelBase> = this.paris.getRepository(<DataEntityType>entityField.type);
				let fieldValueObjectType:EntityConfigBase = !fieldRepository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type);

				let defaultValue:any = fieldRepository && fieldRepository.entity.getDefaultValue()
					|| fieldValueObjectType && fieldValueObjectType.getDefaultValue()
					|| (entityField.isArray ? [] : entityField.defaultValue !== undefined && entityField.defaultValue !== null ? entityField.defaultValue : null);

				if ((defaultValue === undefined || defaultValue === null) && entityField.required) {
					getModelDataError.message = getModelDataError.message + ` Field ${entityField.id} is required but it's ${entityFieldRawData}.`;
					throw getModelDataError;
				}
				modelData[entityField.id] = defaultValue;
			}
			else {
				const getPropertyEntityValue$ = this.getSubModel(entityField, entityFieldRawData, options);
				if (getPropertyEntityValue$)
					subModels.push(getPropertyEntityValue$);
				else {
					modelData[entityField.id] = entityField.isArray
						? entityFieldRawData
							? entityFieldRawData.map((elementValue: any) => DataTransformersService.parse(entityField.type, elementValue))
							: []
						:  DataTransformersService.parse(entityField.type, entityFieldRawData);
				}
			}
		});

		let model$:Observable<TEntity>;

		if (subModels.length) {
			model$ = combineLatest(subModels).pipe(
				map((propertyEntityValues: Array<ModelPropertyValue>) => {
					propertyEntityValues.forEach((propertyEntityValue: { [index: string]: any }) => Object.assign(modelData, propertyEntityValue));

					let model: TEntity;

					try {
						model = new entity.entityConstructor(modelData, rawData);
					} catch (e) {
						getModelDataError.message = getModelDataError.message + " Error: " + e.message;
						throw getModelDataError;
					}

					propertyEntityValues.forEach((modelPropertyValue: ModelPropertyValue) => {
						for (let p in modelPropertyValue) {
							let modelValue: ModelBase | Array<ModelBase> = modelPropertyValue[p];

							if (modelValue instanceof Array)
								modelValue.forEach((modelValueItem: ModelBase) => {
									if (!Object.isFrozen(modelValueItem))
										modelValueItem.$parent = model;
								});
							else if (!Object.isFrozen(modelValue))
								modelValue.$parent = model;
						}
					});

					return model;
				})
			);
		}
		else {
			let model: TEntity;

			try {
				model = new entity.entityConstructor(modelData, rawData);
			} catch (e) {
				getModelDataError.message = getModelDataError.message + " Error: " + e.message;
				throw getModelDataError;
			}

			model$ = of(model);
		}

		return entity.readonly ? model$.pipe(map(model => Object.freeze(model))) : model$;
	}

	private validateFieldData(entityField:Field, rawData:any):boolean{
		let isValid:boolean = true;

		if (entityField.require) {
			if (entityField.require instanceof Function && !entityField.require(rawData, this.paris.config))
				isValid = false;
			else if (typeof(entityField.require) === "string") {
				let rawDataPropertyValue: any = rawData[entityField.require];
				if (rawDataPropertyValue === undefined || rawDataPropertyValue === null)
					isValid = false;
			}
		}

		return isValid;
	}

	/**
	 * Given an EntityField configuration and the raw data provided to the entity's modeler, returns the raw data to use for that field.
	 */
	static getFieldRawData<TRawData extends any = any>(entityField: Field, rawData:TRawData):any{
		let fieldRawData: any;
		if (entityField.data) {
			if (entityField.data instanceof Array) {
				for (let i = 0, path:string; i < entityField.data.length && fieldRawData === undefined; i++) {
					path = entityField.data[i];
					const value = path === FIELD_DATA_SELF ? rawData : get(rawData, path);
					if (value !== undefined && value !== null)
						fieldRawData = value;
				}
			}
			else
				fieldRawData = entityField.data === FIELD_DATA_SELF ? rawData : get(rawData, entityField.data);
		}
		else
			fieldRawData = rawData[entityField.id];

		return fieldRawData;
	}

	private getSubModel(entityField:Field, value:any, options: DataOptions = defaultDataOptions):Observable<ModelPropertyValue>{
		let getPropertyEntityValue$: Observable<ModelPropertyValue>;
		let mapValueToEntityFieldIndex: (value: ModelBase | Array<ModelBase>) => ModelPropertyValue = Modeler.mapToEntityFieldIndex.bind(null, entityField.id);

		let repository:ReadonlyRepository<EntityModelBase> = this.paris.getRepository(<DataEntityType>entityField.type);
		let valueObjectType:EntityConfigBase = !repository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type);

		if (!repository && !valueObjectType)
			return null;

		let tempGetPropertyEntityValue$:Observable<ModelBase | Array<ModelBase>>;

		const getItem = repository
			? Modeler.getEntityItem.bind(null, repository)
			: this.getValueObjectItem.bind(null, valueObjectType);

		if (entityField.isArray) {
			if (value.length) {
				let propertyMembers$: Array<Observable<ModelPropertyValue>> = value.map((memberData: any) => getItem(memberData, options));
				tempGetPropertyEntityValue$ = combineLatest(propertyMembers$);
			}
			else
				tempGetPropertyEntityValue$ = of([]);
		}
		else {
			tempGetPropertyEntityValue$ = getItem(value, options);
		}

		getPropertyEntityValue$ = tempGetPropertyEntityValue$.pipe(map(mapValueToEntityFieldIndex));

		return getPropertyEntityValue$;
	}

	private static mapToEntityFieldIndex(entityFieldId: string, value: ModelBase | Array<ModelBase>): ModelPropertyValue {
		let data: ModelPropertyValue = {};
		data[entityFieldId] = value;
		return data;
	}

	private static getEntityItem<U extends EntityModelBase>(repository: ReadonlyRepository<U>, data: any, options: DataOptions = defaultDataOptions): Observable<U> {
		return Object(data) === data ? repository.createItem(data, options) : repository.getItemById(data, options);
	}

	private getValueObjectItem<U extends ModelBase>(valueObjectType: EntityConfigBase, data: any, options: DataOptions = defaultDataOptions): Observable<U> {
		// If the value object is one of a list of values, just set it to the model
		if (valueObjectType.values)
			return of(valueObjectType.getValueById(data) || valueObjectType.getDefaultValue() || null);

		return this.modelEntity(data, valueObjectType, options);
	}



	rawDataToDataSet<TEntity extends ModelBase, TRawData = any, TDataSet extends any = any>(
		rawDataSet:TDataSet,
		entityConstructor:DataEntityConstructor<TEntity>,
		allItemsProperty:string,
		dataOptions:DataOptions = defaultDataOptions,
		query?:DataQuery):Observable<DataSet<TEntity>>{
		let dataSet:DataSet<TRawData> = Modeler.parseDataSet<TRawData, TDataSet>(rawDataSet, allItemsProperty, entityConstructor.entityConfig && entityConstructor.entityConfig.parseDataSet);

		if (!dataSet.items || !dataSet.items.length)
			return of({ count: 0, items: [] });

		return this.modelArray<TEntity, TRawData>(dataSet.items, entityConstructor, dataOptions, query).pipe(
			map((items:Array<TEntity>) => {
				return Object.freeze(Object.assign(dataSet, {
					items: items,
				}));
			})
		);
	}

	static parseDataSet<TRawData = any, TDataSet extends any = any>(rawDataSet:TDataSet, allItemsProperty:string = DEFAULT_ALL_ITEMS_PROPERTY, parseDataSet?:(rawDataSet:TDataSet) => DataSet<TRawData>):DataSet<TRawData>{
		return rawDataSet instanceof Array
			? { count: 0, items: rawDataSet }
			: parseDataSet
				? parseDataSet(rawDataSet) || { count: 0, items: [] }
				: { count: rawDataSet.count, items: rawDataSet[allItemsProperty] };
	}

	modelArray<TEntity extends ModelBase, TRawData = any>(
		rawData:Array<TRawData>,
		entityConstructor:DataEntityConstructor<TEntity>,
		dataOptions:DataOptions = defaultDataOptions,
		query?:DataQuery):Observable<Array<TEntity>>{
		if (!rawData.length)
			return of([]);
		else {
			const itemCreators: Array<Observable<TEntity>> = rawData.map((itemData: TRawData) =>
				this.modelItem<TEntity, TRawData>(entityConstructor, itemData, dataOptions, query));

			return combineLatest.apply(this, itemCreators);
		}
	}

	private modelItem<TEntity extends ModelBase, TRawData = any>(entityConstructor:DataEntityConstructor<TEntity>, rawData:TRawData, dataOptions: DataOptions = defaultDataOptions, query?:DataQuery):Observable<TEntity>{
		return this.modelEntity(rawData, entityConstructor.entityConfig || entityConstructor.valueObjectConfig, dataOptions, query);
	}

	/**
	 * Serializes a model (entity/value object) into raw data, so it can be sent back to backend.
	 * @param model The model to serialize
	 * @param entity The configuration of the model
	 * @param serializationData Any data that should be passed to serialization methods
	 */
	serializeModel<TEntity extends ModelBase, TRawData = object>(model:Partial<TEntity>, entity:ModelConfig<TEntity, TRawData>, serializationData?:any):TRawData {
		ReadonlyRepository.validateItem(model, entity);

		let modelData: TRawData = <TRawData>{};

		entity.fields.forEach((entityField:Field) => {
			if (entityField.serialize !== false) {
				let itemFieldValue: any = (<any>model)[entityField.id],
					fieldRepository = this.paris.getRepository(<DataEntityType>entityField.type),
					fieldValueObjectType: EntityConfigBase = !fieldRepository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type),
					isNilValue = itemFieldValue === undefined || itemFieldValue === null;

				let modelValue: any;

				if (entityField.serialize)
					modelValue = entityField.serialize(itemFieldValue, serializationData);
				else if (entityField.isArray) {
					if (itemFieldValue) {
						if (fieldRepository || fieldValueObjectType)
							modelValue = itemFieldValue.map((element: any) => this.serializeModel(element, fieldRepository ? fieldRepository.entity : fieldValueObjectType, serializationData));
						else modelValue = itemFieldValue.map((item: any) => DataTransformersService.serialize(entityField.arrayOf, item));
					} else modelValue = null;
				}
				else if (fieldRepository)
					modelValue = isNilValue ? fieldRepository.entity.getDefaultValue() || null : itemFieldValue.id;
				else if (fieldValueObjectType)
					modelValue = isNilValue ? fieldValueObjectType.getDefaultValue() || null : this.serializeModel(itemFieldValue, fieldValueObjectType, serializationData);
				else
					modelValue = DataTransformersService.serialize(entityField.type, itemFieldValue);

				let modelProperty: keyof TRawData = <keyof TRawData>(entityField.data
					? entityField.data instanceof Array ? entityField.data[0] : entityField.data
					: entityField.id);

				modelData[modelProperty] = modelValue;
			}
		});

		if (entity.serializeItem)
			modelData = entity.serializeItem(model, modelData, entity, serializationData);

		return modelData;
	}
}

type ModelPropertyValue = { [property: string]: ModelBase | Array<ModelBase> };

