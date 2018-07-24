import {EntityModelBase} from "../models/entity-model.base";
import {queryToHttpOptions} from "../dataset/query-to-http";
import {ErrorsService} from "../services/errors.service";
import {DataSet} from "../dataset/dataset";
import {DataQuery} from "../dataset/data-query";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {combineLatest, merge, Observable, of, Subject} from "rxjs";
import {HttpOptions} from "../services/http.service";
import {DataStoreService} from "../services/data-store.service";
import {ParisConfig} from "../config/paris-config";
import {EntityBackendConfig, ModelEntity} from "../entity/entity.config";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Paris} from "../services/paris";
import {DataAvailability} from "../dataset/data-availability.enum";
import {Field} from "../entity/entity-field";
import {DataCache} from "../services/cache";
import {Index} from "../models";
import {EntityConfigBase, EntityGetMethod, IEntityConfigBase} from "../entity/entity-config.base";
import {ModelBase} from "../models/model.base";
import {DataTransformersService} from "../services/data-transformers.service";
import * as _ from "lodash";
import {valueObjectsService} from "../services/value-objects.service";
import {AjaxError} from "rxjs/ajax";
import {EntityErrorEvent, EntityErrorTypes} from "../events/entity-error.event";
import {catchError, map, mergeMap, tap} from "rxjs/operators";
import {IReadonlyRepository} from "./repository.interface";
import {FIELD_DATA_SELF} from "../entity/entity-field.config";

export class ReadonlyRepository<TEntity extends ModelBase<TRawData>, TRawData = object> implements IReadonlyRepository<TEntity>{
	protected _errorSubject$: Subject<EntityErrorEvent>;
	error$: Observable<EntityErrorEvent>;

	constructor(public readonly entity: IEntityConfigBase,
				public entityBackendConfig: EntityBackendConfig<TEntity, TRawData>,
				protected config: ParisConfig,
				public entityConstructor: DataEntityConstructor<TEntity>,
				protected dataStore: DataStoreService,
				protected paris: Paris) {
		this._errorSubject$ = new Subject();
		this.error$ = this._errorSubject$.asObservable();
	}

	protected _allItems$: Observable<Array<TEntity>>;
	protected _allValues: Array<TEntity>;
	protected _allValuesMap: Map<string, TEntity>;
	protected _cache: DataCache<TEntity>;
	protected _allItemsSubject$: Subject<Array<TEntity>>;

	protected getBaseUrl(query?: DataQuery): string {
		if (!this.entityBackendConfig.baseUrl)
			return null;

		return this.entityBackendConfig.baseUrl instanceof Function ? this.entityBackendConfig.baseUrl(this.config, query) : this.entityBackendConfig.baseUrl;
	}

	get allItems$(): Observable<Array<TEntity>> {
		if (this._allValues)
			return merge(of(this._allValues), this._allItemsSubject$.asObservable());

		if (this.entityBackendConfig.loadAll)
			return this.setAllItems();

		return this._allItems$;
	}

	protected get cache(): DataCache<TEntity> {
		if (!this._cache) {
			this._cache = new DataCache<TEntity>(typeof(this.entityBackendConfig.cache) === "boolean" ? null : this.entityBackendConfig.cache);
		}

		return this._cache;
	}

	get endpointName():string{
		return this.entityBackendConfig.endpoint instanceof Function ? this.entityBackendConfig.endpoint(this.config) : this.entityBackendConfig.endpoint;
	}

	getEndpointUrl(query?: DataQuery): string{
		return `${this.getBaseUrl(query)}/${this.endpointName}`;
	}

	protected setAllItems(): Observable<Array<TEntity>> {
		if (this._allValues)
			return of(this._allValues);

		return this.query().pipe(
			tap((dataSet: DataSet<TEntity>) => {
				this._allValues = dataSet.items;
				this._allValuesMap = new Map();
				this._allValues.forEach((value: TEntity) => this._allValuesMap.set(String(value instanceof EntityModelBase ? value.id : value.toString()), value));
			}),
			map((dataSet:DataSet<TEntity>) => dataSet.items)
		);
	}

	createNewItem(): TEntity {
		let defaultData:{ [index:string]:any } = {};
		this.entity.fieldsArray.forEach((field:Field) => {
			if (field.defaultValue !== undefined)
				defaultData[field.id] = _.clone(field.defaultValue);
			else if (field.isArray)
				defaultData[field.id] = [];
		});

		return new this.entityConstructor(defaultData);
	}

	createItem(rawData: TRawData, options: DataOptions = { allowCache: true, availability: DataAvailability.available }, query?: DataQuery): Observable<TEntity> {
		return ReadonlyRepository.getModelData<TEntity>(rawData, this.entity, this.config, this.paris, options, query);
	}

	query(query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<TEntity>> {
		if (this.entityConstructor.entityConfig && !this.entityConstructor.entityConfig.supportsGetMethod(EntityGetMethod.query))
			throw new Error(`Can't query ${this.entityConstructor.singularName}, query isn't supported.`);

		return this.paris.callQuery(this.entityConstructor, this.entityBackendConfig, query, dataOptions);
	}

	queryItem(query: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<TEntity> {
		let httpOptions:HttpOptions = this.entityBackendConfig.parseDataQuery ? { params: this.entityBackendConfig.parseDataQuery(query) } : queryToHttpOptions(query);

		if (this.entityBackendConfig.fixedData){
			if (!httpOptions)
				httpOptions = {};

			if (!httpOptions.params)
				httpOptions.params = {};

			Object.assign(httpOptions.params, this.entityBackendConfig.fixedData);
		}

		let endpoint:string;

		if (this.entityBackendConfig.endpoint instanceof Function)
			endpoint = this.entityBackendConfig.endpoint(this.config, query);
		else
			endpoint = `${this.endpointName}${this.entityBackendConfig.allItemsEndpointTrailingSlash !== false && !this.entityBackendConfig.allItemsEndpoint ? '/' : ''}${this.entityBackendConfig.allItemsEndpoint || ''}`;

		const getItem$:Observable<TEntity> = this.dataStore.get(
			endpoint,
			httpOptions,
			this.getBaseUrl(query),
			this.entityBackendConfig.timeout ? { timeout: this.entityBackendConfig.timeout } : null).pipe(
			catchError((err: AjaxError) => {
				this.emitEntityHttpErrorEvent(err);
				throw err
			}),
			mergeMap(data => this.createItem(data, dataOptions, query))
		);

		if (dataOptions.allowCache !== false && this.entityBackendConfig.cache)
			return this.cache.get(endpoint, httpOptions.params, () => getItem$);
		else
			return getItem$;
	}

	clearCache():void {
		this.cache.clear();
	}

	clearAllValues():void {
		this._allValues = null;
	}

	getItemById(itemId: string | number, options: DataOptions = defaultDataOptions, params?:{ [index:string]:any }): Observable<TEntity> {
		if (!this.entityConstructor.entityConfig.supportsGetMethod(EntityGetMethod.getItem))
			throw new Error(`Can't get ${this.entityConstructor.singularName}, getItem isn't supported.`);

		let idFieldIndex:number = _.findIndex(this.entity.fieldsArray, field => field.id === "id");
		if (~idFieldIndex){
			let idField:Field = this.entity.fieldsArray[idFieldIndex];
			if (idField.type === Number && typeof(itemId) === "string") {
				let originalItemId = itemId;
				itemId = parseInt(itemId, 10);
				if (isNaN(itemId))
					throw new Error(`Invalid ID for ${this.entity.singularName}. Expected a number but got: ${originalItemId}.`);
			}
		}

		if (this.entity.values) {
			let entityValue: TEntity;
			if (itemId !== null && itemId !== undefined){
				if (this.entity.hasValue(itemId))
					entityValue = this.entity.getValueById(itemId);
				else
					ErrorsService.warn(`Unknown value for ${this.entity.singularName}: `, itemId);
			}

			return of(entityValue || this.entity.getDefaultValue());
		}

		if (this.entityBackendConfig.loadAll) {
			return this.setAllItems().pipe(
				map(() => this._allValuesMap.get(String(itemId)))
			);
		}
		else {
			const endpoint:string = this.entityBackendConfig.parseItemQuery ? this.entityBackendConfig.parseItemQuery(itemId, this.entity, this.config, params) : `${this.endpointName}/${itemId}`;

			const getItem$:Observable<TEntity> = this.dataStore.get(
				endpoint,
				params && {params: params},
				this.getBaseUrl({where: params}),
				this.entityBackendConfig.timeout ? { timeout: this.entityBackendConfig.timeout } : null
			).pipe(
				catchError((err: AjaxError) => {
					this.emitEntityHttpErrorEvent(err);
					throw err
				}),
				mergeMap(data => this.createItem(data, options, { where: Object.assign({ itemId: itemId }, params) }))
			);

			if (options.allowCache !== false && this.entityBackendConfig.cache)
				return this.cache.get(endpoint, params, () => getItem$);
			else
				return getItem$;
		}
	}

	/**
	 * Creates a JSON object that can be saved to server, with the reverse logic of getItemModelData
	 * @param {T} item
	 * @returns {Index}
	 */
	serializeItem(item:TEntity, serializationData?:any): TRawData {
		ReadonlyRepository.validateItem(item, this.entity);

		return ReadonlyRepository.serializeItem<TRawData>(item, this.entity, this.paris, serializationData);
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
	static getModelData<T extends ModelBase, TRawData extends any = any>(rawData: TRawData, entity: IEntityConfigBase, config: ParisConfig, paris: Paris, options: DataOptions = defaultDataOptions, query?: DataQuery): Observable<T> {
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
					propertyValue = entityField.parse(propertyValue, rawData, query);
				}
				catch(e){
					getModelDataError.message = getModelDataError.message + ` Error parsing field ${entityField.id}: ` + e.message;
					throw getModelDataError;
				}
			}
			if (propertyValue === undefined || propertyValue === null) {
				let fieldRepository:ReadonlyRepository<EntityModelBase> = paris.getRepository(<DataEntityType>entityField.type);
				let fieldValueObjectType:EntityConfigBase = !fieldRepository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type);

				let defaultValue:any = fieldRepository && fieldRepository.entity.getDefaultValue()
					|| fieldValueObjectType && fieldValueObjectType.getDefaultValue()
					|| (entityField.isArray ? [] : entityField.defaultValue !== undefined && entityField.defaultValue !== null ? entityField.defaultValue : null);

				if ((defaultValue === undefined || defaultValue === null) && entityField.required) {
					getModelDataError.message = getModelDataError.message + ` Field ${entityField.id} is required but it's ${propertyValue}.`;
					throw getModelDataError;
				}
				modelData[entityField.id] = defaultValue;
			}
			else {
				const getPropertyEntityValue$ = ReadonlyRepository.getSubModel(entityField, propertyValue, paris, config, options);
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
			model$ = combineLatest(subModels).pipe(
				map((propertyEntityValues: Array<ModelPropertyValue>) => {
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
				})
			);
		}
		else {
			let model: T;

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

	private static getSubModel(entityField:Field, value:any, paris:Paris, config:ParisConfig, options: DataOptions = defaultDataOptions):Observable<ModelPropertyValue>{
		let getPropertyEntityValue$: Observable<ModelPropertyValue>;
		let mapValueToEntityFieldIndex: (value: ModelBase | Array<ModelBase>) => ModelPropertyValue = ReadonlyRepository.mapToEntityFieldIndex.bind(null, entityField.id);

		let repository:ReadonlyRepository<EntityModelBase> = paris.getRepository(<DataEntityType>entityField.type);
		let valueObjectType:EntityConfigBase = !repository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type);

		if (!repository && !valueObjectType)
			return null;

		let tempGetPropertyEntityValue$:Observable<ModelBase | Array<ModelBase>>;

		const getItem = repository
			? ReadonlyRepository.getEntityItem.bind(null, repository)
			: ReadonlyRepository.getValueObjectItem.bind(null, valueObjectType);

		if (entityField.isArray) {
			if (value.length) {
				let propertyMembers$: Array<Observable<ModelPropertyValue>> = value.map((memberData: any) => getItem(memberData, options, paris, config));
				tempGetPropertyEntityValue$ = combineLatest(propertyMembers$);
			}
			else
				tempGetPropertyEntityValue$ = of([]);
		}
		else {
			tempGetPropertyEntityValue$ = getItem(value, options, paris, config);
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

	private static getValueObjectItem<U extends ModelBase>(valueObjectType: EntityConfigBase, data: any, options: DataOptions = defaultDataOptions, paris: Paris, config?: ParisConfig): Observable<U> {
		// If the value object is one of a list of values, just set it to the model
		if (valueObjectType.values)
			return of(valueObjectType.getValueById(data) || valueObjectType.getDefaultValue() || null);

		return ReadonlyRepository.getModelData(data, valueObjectType, config, paris, options);
	}

	/**
	 * Validates that the specified item is valid, according to the requirements of the entity (or value object) it belongs to.
	 * Meaning, that it can be used as data for creating an instance of T.
	 * @param item
	 * @param {EntityConfigBase} entity
	 * @returns {boolean}
	 */
	static validateItem(item:{}, entity:IEntityConfigBase):boolean{
		entity.fields.forEach((entityField:Field) => {
			let itemFieldValue: any = (<any>item)[entityField.id];

			if (entityField.required && (itemFieldValue === undefined || itemFieldValue === null))
				throw new Error(`Missing value for field '${entityField.id}'`);
		});

		return true;
	}

	/**
	 * Serializes an object value
	 * @param item
	 * @returns {Index}
	 */
	static serializeItem<TRawData extends any = object>(item:{}, entity:IEntityConfigBase, paris:Paris, serializationData?:any):TRawData{
		ReadonlyRepository.validateItem(item, entity);

		let modelData: TRawData = <TRawData>{};

		entity.fields.forEach((entityField:Field) => {
			if (entityField.serialize !== false) {
				let itemFieldValue: any = (<any>item)[entityField.id],
					fieldRepository = paris.getRepository(<DataEntityType>entityField.type),
					fieldValueObjectType: EntityConfigBase = !fieldRepository && valueObjectsService.getEntityByType(<DataEntityType>entityField.type),
					isNilValue = itemFieldValue === undefined || itemFieldValue === null;

				let modelValue: any;

				if (entityField.serialize)
					modelValue = entityField.serialize(itemFieldValue, serializationData);
				else if (entityField.isArray) {
					if (itemFieldValue) {
						if (fieldRepository || fieldValueObjectType)
							modelValue = itemFieldValue.map((element: any) => ReadonlyRepository.serializeItem(element, fieldRepository ? fieldRepository.entity : fieldValueObjectType, paris, serializationData));
						else modelValue = itemFieldValue.map((item: any) => DataTransformersService.serialize(entityField.arrayOf, item));
					} else modelValue = null;
				}
				else if (fieldRepository)
					modelValue = isNilValue ? fieldRepository.entity.getDefaultValue() || null : itemFieldValue.id;
				else if (fieldValueObjectType)
					modelValue = isNilValue ? fieldValueObjectType.getDefaultValue() || null : ReadonlyRepository.serializeItem(itemFieldValue, fieldValueObjectType, paris, serializationData);
				else
					modelValue = DataTransformersService.serialize(entityField.type, itemFieldValue);

				let modelProperty: string = entityField.data
					? entityField.data instanceof Array ? entityField.data[0] : entityField.data
					: entityField.id;

				modelData[modelProperty] = modelValue;
			}
		});

		if (entity.serializeItem)
			modelData = entity.serializeItem(item, modelData, entity, paris.config, serializationData);

		return modelData;
	}

	protected emitEntityHttpErrorEvent(err: AjaxError) {
		this._errorSubject$.next({
			entity: this.entityConstructor,
			type: EntityErrorTypes.HttpError,
			originalError: err
		});
	}
}

type ModelPropertyValue = { [property: string]: ModelBase | Array<ModelBase> };
