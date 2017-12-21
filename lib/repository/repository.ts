import {ModelEntity} from "../entity/entity.config";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Field, FIELD_DATA_SELF} from "../entity/entity-field";
import {IRepository} from "./repository.interface";
import {DataStoreService} from "../services/data-store.service";
import {ParisConfig} from "../config/paris-config";
import {DataQuery} from "../dataset/data-query";
import {DataSet} from "../dataset/dataset";
import {Index} from "../models/index";
import {DataTransformersService} from "../services/data-transformers.service";
import {DataCache, DataCacheSettings} from "../services/cache";
import {valueObjectsService} from "../services/value-objects.service";
import * as _ from "lodash";
import {EntityConfigBase} from "../entity/entity-config.base";
import {ModelBase} from "../models/model.base";
import {EntityModelBase} from "../models/entity-model.base";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {Paris} from "../services/paris";
import {DatasetService} from "../services/dataset.service";
import {HttpOptions} from "../services/http.service";
import {DataAvailability} from "../dataset/data-availability.enum";
import {ErrorsService} from "../services/errors.service";

export class Repository<T extends EntityModelBase> implements IRepository {
	save$: Observable<T>;
	private _allItems$: Observable<Array<T>>;

	private _allValues: Array<T>;
	private _allValuesMap: Map<string, T>;
	private _cache: DataCache<T>;
	private _allItemsSubject$: Subject<Array<T>>;
	private _saveSubject$: Subject<T>;

	get allItems$(): Observable<Array<T>> {
		if (this._allValues)
			return Observable.merge(Observable.of(this._allValues), this._allItemsSubject$.asObservable());

		if (this.entity.loadAll)
			return this.setAllItems();

		return this._allItems$;
	}

	private get cache(): DataCache<T> {
		if (!this._cache) {
			let cacheSettings: DataCacheSettings<T> = Object.assign({
				getter: (itemId: string | number) => this.getItemById(itemId, {allowCache: false})
			}, this.entity.cache);

			this._cache = new DataCache<T>(cacheSettings);
		}

		return this._cache;
	}

	private get baseUrl(): string {
		if (!this.entity.baseUrl)
			return null;

		return this.entity.baseUrl instanceof Function ? this.entity.baseUrl(this.config) : this.entity.baseUrl;
	}

	get endpointName():string{
		return this.entity.endpoint instanceof Function ? this.entity.endpoint(this.config) : this.entity.endpoint;
	}

	get endpointUrl():string{
		return `${this.baseUrl}/${this.endpointName}`;
	}

	constructor(public readonly entity: ModelEntity,
				private config: ParisConfig,
				private entityConstructor: DataEntityConstructor<T>,
				private dataStore: DataStoreService,
				private paris: Paris) {
		let getAllItems$: Observable<Array<T>> = this.query().map(dataSet => dataSet.items);

		this._allItemsSubject$ = new Subject<Array<T>>();
		this._allItems$ = Observable.merge(getAllItems$, this._allItemsSubject$.asObservable());

		this._saveSubject$ = new Subject();
		this.save$ = this._saveSubject$.asObservable();
	}

	createItem(itemData: any, options: DataOptions = { allowCache: true, availability: DataAvailability.available }): Observable<T> {
		return Repository.getModelData(itemData, this.entity, this.config, this.paris, options);
	}

	createNewItem(): T {
		return new this.entityConstructor();
	}

	/**
	 * Populates the item dataset with any sub @model. For example, if an ID is found for a property whose type is an entity,
	 * the property's value will be an instance of that entity, for the ID, not the ID.
	 * @param {Index} rawData
	 * @param {EntityConfigBase} entity
	 * @param {ParisConfig} config
	 * @param {Paris} paris
	 * @param {DataOptions} options
	 * @returns {Observable<T extends EntityModelBase>}
	 */
	static getModelData<T extends ModelBase>(rawData: Index, entity: EntityConfigBase, config: ParisConfig, paris: Paris, options: DataOptions = defaultDataOptions): Observable<T> {
		let entityIdProperty: string = entity.idProperty || config.entityIdProperty,
			modelData: Index = entity instanceof ModelEntity ? {id: rawData[entityIdProperty]} : {},
			subModels: Array<Observable<{ [index: string]: ModelBase | Array<ModelBase> }>> = [];

		let getModelDataError:Error = new Error(`Failed to create ${entity.singularName}.`);

		entity.fields.forEach((entityField: Field) => {
			if (entityField.require){
				let failed:boolean = false;

				if (entityField.require instanceof Function && !entityField.require(rawData, paris.config))
					failed = true;
				else if (typeof(entityField.require) === "string") {
					let rawDataPropertyValue: any = rawData[entityField.require];
					if (rawDataPropertyValue === undefined || rawDataPropertyValue === null)
						failed = true;
				}

				if (failed){
					modelData[entityField.id] = null;
					return;
				}
			}

			let propertyValue: any;
			if (entityField.data) {
				if (entityField.data instanceof Array) {
					for (let i = 0, path:string; i < entityField.data.length && propertyValue === undefined; i++) {
						path = entityField.data[i];
						let value:any = path === FIELD_DATA_SELF ? rawData : _.get(rawData, path);
						if (value !== undefined && value !== null)
							propertyValue = value;
					}
				}
				else
					propertyValue = entityField.data === FIELD_DATA_SELF ? rawData : _.get(rawData, entityField.data);
			}
			else
				propertyValue = rawData[entityField.id];

			if (entityField.parse) {
				try {
					propertyValue = entityField.parse(propertyValue, rawData);
				}
				catch(e){
					getModelDataError.message = getModelDataError.message + ` Error parsing field ${entityField.id}: ` + e.message;
					throw getModelDataError;
				}
			}
			if (propertyValue === undefined || propertyValue === null) {
				let fieldRepository:Repository<EntityModelBase> = paris.getRepository(entityField.type);
				let fieldValueObjectType:EntityConfigBase = !fieldRepository && valueObjectsService.getEntityByType(entityField.type);

				let defaultValue:any = fieldRepository && fieldRepository.entity.getDefaultValue()
					|| fieldValueObjectType && fieldValueObjectType.getDefaultValue()
					|| (entityField.isArray ? [] : entityField.defaultValue || null);

				if (!defaultValue && entityField.required) {
					getModelDataError.message = getModelDataError.message + ` Field ${entityField.id} is required but it's ${propertyValue}.`;
					throw getModelDataError;
				}
				modelData[entityField.id] = defaultValue;
			}
			else {
				const getPropertyEntityValue$ = Repository.getSubModel(entityField, propertyValue, paris, config, options);
				if (getPropertyEntityValue$)
					subModels.push(getPropertyEntityValue$);
				else {
					modelData[entityField.id] = entityField.isArray
						? propertyValue
							? propertyValue.map((elementValue: any) => DataTransformersService.parse(entityField.type, elementValue))
							: []
						:  DataTransformersService.parse(entityField.type, propertyValue);
				}
			}
		});

		let model$:Observable<T>;

		if (subModels.length) {
			model$ = Observable.combineLatest.apply(Observable, subModels).map((propertyEntityValues: Array<ModelPropertyValue>) => {
				propertyEntityValues.forEach((propertyEntityValue: { [index: string]: any }) => Object.assign(modelData, propertyEntityValue));

				let model: T;

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
			});
		}
		else {
			let model: T;

			try {
				model = new entity.entityConstructor(modelData, rawData);
			} catch (e) {
				getModelDataError.message = getModelDataError.message + " Error: " + e.message;
				throw getModelDataError;
			}

			model$ = Observable.of(model);
		}

		return entity.readonly ? model$.map(model => Object.freeze(model)) : model$;
	}

	private static getSubModel(entityField:Field, value:any, paris:Paris, config:ParisConfig, options: DataOptions = defaultDataOptions):Observable<ModelPropertyValue>{
		let getPropertyEntityValue$: Observable<ModelPropertyValue>;
		let mapValueToEntityFieldIndex: (value: ModelBase | Array<ModelBase>) => ModelPropertyValue = Repository.mapToEntityFieldIndex.bind(null, entityField.id);

		let repository:Repository<EntityModelBase> = paris.getRepository(entityField.type);
		let valueObjectType:EntityConfigBase = !repository && valueObjectsService.getEntityByType(entityField.type);

		if (!repository && !valueObjectType)
			return null;

		const getItem = repository
			? Repository.getEntityItem.bind(null, repository)
			: Repository.getValueObjectItem.bind(null, valueObjectType);

		if (entityField.isArray) {
			if (value.length) {
				let propertyMembers$: Array<Observable<ModelPropertyValue>> = value.map((memberData: any) => getItem(memberData, options, paris, config));
				getPropertyEntityValue$ = Observable.combineLatest.apply(Observable, propertyMembers$).map(mapValueToEntityFieldIndex);
			}
			else
				getPropertyEntityValue$ = Observable.of([]).map(mapValueToEntityFieldIndex);
		}
		else
			getPropertyEntityValue$ = getItem(value, options, paris, config)
				.map(mapValueToEntityFieldIndex);

		return getPropertyEntityValue$;
	}

	private static mapToEntityFieldIndex(entityFieldId: string, value: ModelBase | Array<ModelBase>): ModelPropertyValue {
		let data: ModelPropertyValue = {};
		data[entityFieldId] = value;
		return data;
	}

	private static getEntityItem<U extends EntityModelBase>(repository: Repository<U>, data: any, options: DataOptions = defaultDataOptions): Observable<U> {
		return Object(data) === data ? repository.createItem(data, options) : repository.getItemById(data, options);
	}

	private static getValueObjectItem<U extends ModelBase>(valueObjectType: EntityConfigBase, data: any, options: DataOptions = defaultDataOptions, paris: Paris, config?: ParisConfig): Observable<U> {
		// If the value object is one of a list of values, just set it to the model
		if (valueObjectType.values)
			return Observable.of(valueObjectType.getValueById(data) || valueObjectType.getDefaultValue() || null);

		return Repository.getModelData(data, valueObjectType, config, paris, options);
	}

	query(query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<T>> {
		let queryError:Error = new Error(`Failed to get ${this.entity.pluralName}.`);
		const httpOptions:HttpOptions = this.entity.parseDataQuery ? { params: this.entity.parseDataQuery(query) } : DatasetService.queryToHttpOptions(query);

		return this.dataStore.get(`${this.endpointName}${this.entity.allItemsEndpointTrailingSlash !== false && !this.entity.allItemsEndpoint ? '/' : ''}${this.entity.allItemsEndpoint || ''}`, httpOptions, this.baseUrl)
			.map((rawDataSet: any) => {
				const allItemsProperty = this.entity.allItemsProperty || this.config.allItemsProperty;

				let rawItems: Array<any> = rawDataSet instanceof Array ? rawDataSet : rawDataSet[allItemsProperty];

				if (!rawItems)
					ErrorsService.warn(`Property '${this.config.allItemsProperty}' wasn't found in DataSet for Entity '${this.entity.pluralName}'.`);
				return {
					count: rawDataSet.count,
					items: rawItems
				}
			})
			.flatMap((dataSet: DataSet<any>) => {
				let itemCreators: Array<Observable<T>> = dataSet.items.map((itemData: any) => this.createItem(itemData, dataOptions));

				return Observable.combineLatest.apply(this, itemCreators).map((items: Array<T>) => {
					return Object.freeze({
						count: dataSet.count,
						items: items
					});
				}).catch((error:Error) => {
					queryError.message = queryError.message + " Error: " + error.message;
					throw queryError;
				});
			});
	}

	getItemById(itemId: string | number, options: DataOptions = defaultDataOptions, params?:{ [index:string]:any }): Observable<T> {
		if (this.entity.values) {

			let entityValue: T;
			if (itemId !== null && itemId !== undefined){
				if (this.entity.hasValue(itemId))
					entityValue = this.entity.getValueById(itemId);
				else
					ErrorsService.warn(`Unknown value for ${this.entity.singularName}: `, itemId);
			}

			return Observable.of(entityValue || this.entity.getDefaultValue());
		}

		if (options.allowCache !== false && this.entity.cache)
			return this.cache.get(itemId);

		if (this.entity.loadAll)
			return this.setAllItems().map(() => this._allValuesMap.get(String(itemId)));
		else {
			return this.dataStore.get(this.entity.parseItemQuery ? this.entity.parseItemQuery(itemId, this.entity, this.config) : `${this.endpointName}/${itemId}`, params && { params: params }, this.baseUrl)
				.flatMap(data => this.createItem(data, options));
		}
	}

	private setAllItems(): Observable<Array<T>> {
		if (this._allValues)
			return Observable.of(this._allValues);

		return this.query().do((dataSet: DataSet<T>) => {
			this._allValues = dataSet.items;
			this._allValuesMap = new Map();
			this._allValues.forEach((value: T) => this._allValuesMap.set(String(value.id), value));
		}).map(dataSet => dataSet.items);
	}

	/**
	 * Saves an entity to the server
	 * @param {T} item
	 * @returns {Observable<T extends EntityModelBase>}
	 */
	save(item: T): Observable<T> {
		if (!this.entity.endpoint)
			throw new Error(`Entity ${this.entity.entityConstructor.name} can be saved - it doesn't specify an endpoint.`);

		try {
			let saveData: Index = this.serializeItem(item);
			return this.dataStore.save(`${this.entity.endpoint}/${item.id || ''}`, item.id === undefined ? "POST" : "PUT", { data: saveData })
				.flatMap((savedItemData: Index) => this.createItem(savedItemData))
				.do((item: T) => {
					if (this._allValues) {
						this._allValues = [...this._allValues, item];
						this._allItemsSubject$.next(this._allValues);
					}

					this._saveSubject$.next(item);
				});
		}
		catch(e){
			return Observable.throw(e);
		}
	}

	/**
	 * Validates that the specified item is valid, according to the requirements of the entity (or value object) it belongs to.
	 * @param item
	 * @param {EntityConfigBase} entity
	 * @returns {boolean}
	 */
	static validateItem(item:any, entity:EntityConfigBase):boolean{
		entity.fields.forEach((entityField:Field) => {
			let itemFieldValue: any = (<any>item)[entityField.id];

			if (entityField.required && (itemFieldValue === undefined || itemFieldValue === null))
				throw new Error(`Missing value for field '${entityField.id}'`);
		});

		return true;
	}

	/**
	 * Creates a JSON object that can be saved to server, with the reverse logic of getItemModelData
	 * @param {T} item
	 * @returns {Index}
	 */
	serializeItem(item:T): Index {
		Repository.validateItem(item, this.entity);

		return Repository.serializeItem(item, this.entity, this.paris);
	}

	/**
	 * Serializes an object value
	 * @param item
	 * @returns {Index}
	 */
	static serializeItem(item:any, entity:EntityConfigBase, paris:Paris):Index{
		Repository.validateItem(item, entity);

		let modelData: Index = {};

		entity.fields.forEach((entityField:Field) => {
			let itemFieldValue:any = (<any>item)[entityField.id],
				fieldRepository = paris.getRepository(entityField.type),
				fieldValueObjectType:EntityConfigBase = !fieldRepository && valueObjectsService.getEntityByType(entityField.type),
				isNilValue = itemFieldValue === undefined || itemFieldValue === null;

			let modelValue:any;

			if (entityField.isArray)
				modelValue =  itemFieldValue ? itemFieldValue.map((element:any) => Repository.serializeItem(element, fieldRepository ? fieldRepository.entity : fieldValueObjectType, paris)) : null;
			else if (fieldRepository)
				modelValue = isNilValue ? fieldRepository.entity.getDefaultValue() || null : itemFieldValue.id;
			else if (fieldValueObjectType)
				modelValue = isNilValue ? fieldValueObjectType.getDefaultValue() || null : Repository.serializeItem(itemFieldValue, fieldValueObjectType, paris);
			else
				modelValue = DataTransformersService.serialize(entityField.type, itemFieldValue);

			let modelProperty:string = entityField.data
				? entityField.data instanceof Array ? entityField.data[0] : entityField.data
				: entityField.id;

			modelData[modelProperty] = modelValue;
		});

		return modelData;
	}
}

type ModelPropertyValue = { [property: string]: ModelBase | Array<ModelBase> };
