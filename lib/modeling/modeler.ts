import {ModelBase} from "../config/model.base";
import {DataEntityType} from "../api/entity/data-entity.base";
import {Paris} from "../paris";
import {combineLatest, Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {valueObjectsService} from "../config/services/value-objects.service";
import {EntityConfigBase, ModelConfig} from "../config/model-config";
import {ModelEntity} from "../config/entity.config";
import {FIELD_DATA_SELF} from "../config/entity-field.config";
import {get} from "lodash-es";
import {DataTransformersService} from "./data-transformers.service";
import {Field} from "../api/entity/entity-field";
import {EntityModelBase} from "../config/entity-model.base";
import {DataOptions, defaultDataOptions} from "../data_access/data.options";
import {DataQuery} from "../data_access/data-query";
import {ReadonlyRepository} from "../api/repository/readonly-repository";
import {DataSet} from "../data_access/dataset";

const DEFAULT_ALL_ITEMS_PROPERTY = 'items';

export class Modeler {
	constructor(private paris:Paris){}

	/**
	 * Models an Entity or ValueObject, according to raw data and configuration.
	 * In Domain-Driven Design terms, this method creates an Aggregate Root. It does the actual heavy lifting required for modeling
	 * an Entity or ValueObject - parses the fields, models sub-models, etc.
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
			modelData: Partial<TEntity> = {},
			subModels: Array<Observable<ModelPropertyValue<TEntity>>> = [];

		if (entity instanceof ModelEntity)
			modelData.id = rawData[entityIdProperty];

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
				modelData[<keyof TEntity>entityField.id] = null;
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

			try {
				const fieldData = this.getFieldData(entityField, entityFieldRawData, options);
				if (fieldData instanceof Observable) {
					subModels.push(fieldData.pipe(
						map((fieldData: ModelBase | Array<ModelBase>) => {
								let subModelIndex: ModelPropertyValue<TEntity> = <ModelPropertyValue<TEntity>>{};
								subModelIndex[<keyof TEntity>entityField.id] = fieldData;
								return subModelIndex;
							}
						)));
				}
				else
					modelData[<keyof TEntity>entityField.id] = fieldData;
			}
			catch(e){
				getModelDataError.message = getModelDataError.message + ' ' + e.message;
				throw getModelDataError;
			}
		});

		let model$:Observable<TEntity>;

		if (subModels.length) {
			model$ = combineLatest(subModels).pipe(
				map((propertyEntityValues: Array<ModelPropertyValue<TEntity>>) => {
					propertyEntityValues.forEach((propertyEntityValue: ModelPropertyValue<TEntity>) => Object.assign(modelData, propertyEntityValue));

					let model: TEntity;

					try {
						model = new entity.entityConstructor(modelData, rawData);
					} catch (e) {
						getModelDataError.message = getModelDataError.message + " Error: " + e.message;
						throw getModelDataError;
					}

					this.setModelLinks(model);

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
	 * For all the sub models in a model that are not readonly, add a $parent property, which points to the model
	 * @param {TEntity} model
	 */
	private setModelLinks<TEntity extends ModelBase>(model:TEntity):void{
		(<DataEntityType<TEntity>>model.constructor).entityConfig.fieldsArray.forEach((field:Field) => {
			const modelValue = model[<keyof TEntity>field.id];

			if (modelValue && modelValue instanceof Object){
				if (modelValue instanceof ModelBase && !Object.isFrozen(modelValue))
					(<ModelBase>modelValue).$parent = model;
				else if (modelValue instanceof Array && modelValue.length && modelValue[0] instanceof ModelBase){
					modelValue.forEach((modelValueItem: ModelBase) => {
						if (!Object.isFrozen(modelValueItem))
							modelValueItem.$parent = model;
					});
				}
			}
		});
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

	/**
	 * Gets the data to be assigned in a model to the specified field.
	 * If no data is available in the raw data, a default value is assigned, if specified.
	 * If the field's type is of another model, it'll be modeled as well. Otherwise, the data is parsed according to the DataTransformersService parsers.
	 */
	private getFieldData<TData = any>(entityField:Field, entityFieldRawData:any, options: DataOptions = defaultDataOptions):TData | Observable<TData | Array<TData>> {
		if (entityFieldRawData === undefined || entityFieldRawData === null) {
			let fieldRepository:ReadonlyRepository<EntityModelBase> = this.paris.getRepository(<DataEntityType>entityField.type);
			let fieldValueObjectType:EntityConfigBase = !fieldRepository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type);

			let defaultValue:any = fieldRepository && fieldRepository.modelConfig.getDefaultValue()
				|| fieldValueObjectType && fieldValueObjectType.getDefaultValue()
				|| (entityField.isArray ? [] : entityField.defaultValue !== undefined && entityField.defaultValue !== null ? entityField.defaultValue : null);

			if ((defaultValue === undefined || defaultValue === null) && entityField.required)
				throw new Error(` Field ${entityField.id} is required but it's ${entityFieldRawData}.`);

			entityFieldRawData = defaultValue;
		}

		if (entityFieldRawData && !(entityFieldRawData instanceof ModelBase)) {
			const fieldData$ = this.getSubModel<TData>(entityField, entityFieldRawData, options);
			if (fieldData$)
				return fieldData$;
			else {
				return entityField.isArray
					? entityFieldRawData
						? entityFieldRawData.map((elementValue: any) => DataTransformersService.parse(entityField.type, elementValue))
						: []
					: DataTransformersService.parse(entityField.type, entityFieldRawData);
			}
		}
		else
			return entityFieldRawData;
	}

	private getSubModel<TData extends ModelBase = ModelBase>(entityField:Field, value:any, options: DataOptions = defaultDataOptions):Observable<TData | Array<TData>>{
		let repository:ReadonlyRepository<EntityModelBase> = this.paris.getRepository(<DataEntityType>entityField.type);
		let valueObjectType:EntityConfigBase = !repository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type);

		if (!repository && !valueObjectType)
			return null;

		let data$:Observable<TData | Array<TData>>;

		const getItem = repository
			? Modeler.getEntityItem.bind(null, repository)
			: this.getValueObjectItem.bind(null, valueObjectType);

		if (entityField.isArray) {
			if (value.length) {
				let propertyMembers$: Array<Observable<TData>> = value.map((memberData: any) => getItem(memberData, options));
				data$ = combineLatest(propertyMembers$);
			}
			else
				data$ = of([]);
		}
		else
			data$ = getItem(value, options);

		return data$;
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
		entityConstructor:DataEntityType<TEntity>,
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
		entityConstructor:DataEntityType<TEntity>,
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

	private modelItem<TEntity extends ModelBase, TRawData = any>(entityConstructor:DataEntityType<TEntity>, rawData:TRawData, dataOptions: DataOptions = defaultDataOptions, query?:DataQuery):Observable<TEntity>{
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

type ModelPropertyValue<TEntity> = { [P in keyof TEntity]: ModelBase | Array<ModelBase> };

