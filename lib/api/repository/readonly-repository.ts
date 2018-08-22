import {clone} from "lodash-es";
import {merge, Observable, of, Subject} from "rxjs";
import {AjaxError} from "rxjs/ajax";
import {DataEntityType} from "../entity/data-entity.base";
import {EntityConfigBase, EntityGetMethod, ModelConfig} from "../../config/model-config";
import {Field} from "../entity/entity-field";
import {EntityBackendConfig, EntityConfig} from "../../config/entity.config";
import {EntityErrorEvent, EntityErrorTypes} from "../events/entity-error.event";
import {EntityId} from "../../modeling/entity-id.type";
import {EntityModelBase} from "../../config/entity-model.base";
import {ModelBase} from "../../config/model.base";
import {DataCache} from "../../data_access/cache";
import {ErrorsService} from "../errors.service";
import {HttpOptions} from "../../data_access/http.service";
import {Paris} from "../../paris";
import {IReadonlyRepository} from "./repository.interface";
import {DataQuery} from "../../data_access/data-query";
import {catchError, map, mergeMap, tap} from "rxjs/operators";
import {DataSet} from "../../data_access/dataset";
import {DataOptions, defaultDataOptions} from "../../data_access/data.options";
import {DataAvailability} from "../../data_access/data-availability.enum";
import {queryToHttpOptions} from "../../data_access/query-to-http";

/**
 * A Repository is a service through which all of an Entity's data is fetched, cached and saved back to the backend.
 *
 * `ReadonlyRepository` is the base class for all Repositories, and the class used for Repositories that are readonly.
 */
export class ReadonlyRepository<TEntity extends ModelBase, TRawData = any> implements IReadonlyRepository<TEntity>{
	protected _errorSubject$: Subject<EntityErrorEvent>;
	error$: Observable<EntityErrorEvent>;

	protected entityBackendConfig:EntityBackendConfig<TEntity, TRawData>;

	constructor(public entityConstructor: DataEntityType<TEntity, TRawData>,
				protected paris: Paris) {
		this._errorSubject$ = new Subject();
		this.error$ = this._errorSubject$.asObservable();
		this.entityBackendConfig = entityConstructor.entityConfig;
	}

	protected _allItems$: Observable<Array<TEntity>>;
	protected _allValues: Array<TEntity>;
	protected _allValuesMap: Map<string, TEntity>;
	protected _cache: DataCache<TEntity>;
	protected _allItemsSubject$: Subject<Array<TEntity>>;


	protected getBaseUrl(query?: DataQuery): string {
		if (!this.entity.baseUrl)
			return null;

		return this.entityBackendConfig.baseUrl instanceof Function ? this.entityBackendConfig.baseUrl(this.paris.config, query) : this.entityBackendConfig.baseUrl;
	}

	get entity():EntityConfig<TEntity, TRawData>{
		return this.entityConstructor.entityConfig;
	}

	get modelConfig():EntityConfigBase<TEntity, TRawData> {
		return this.entityConstructor.entityConfig || this.entityConstructor.valueObjectConfig;
	}

	/**
	 * All the hard-coded values of an Entity, as specified through the `values` configuration.
	 * @returns {Array<TEntity extends ModelBase>}
	 */
	get values():Array<TEntity>{
		return this.entity.values || null;
	}

	/**
	 * An Observable for all the items of this entity. If the Entity has already loaded all possible items (if `loadAll` is set to `true`, for example), those items are returned.
	 * Otherwise, a query with no DataQuery will be performed to the backend and the data will be fetched.
	 * @returns {Observable<Array<TEntity extends ModelBase>>}
	 */
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

	/**
	 * The base URL for this Repository's API calls (not including base URL - the domain)
	 * @returns {string}
	 */
	get endpointName():string{
		return this.entityBackendConfig.endpoint instanceof Function ? this.entityBackendConfig.endpoint(this.paris.config) : this.entityBackendConfig.endpoint;
	}

	/**
	 * Returns the full URL for an API call
	 * @param {DataQuery} query
	 * @returns {string}
	 */
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

	/**
	 * Creates a new instance of the Repository's entity.
	 * All fields will be undefined, except those that have defaultValue or those that are arrays, which will have an empty array as value.
	 * @returns {TEntity}
	 */
	createNewItem(): TEntity {
		let defaultData:Partial<TEntity> = {};
		this.modelConfig.fieldsArray.forEach((field:Field) => {
			if (field.defaultValue !== undefined)
				defaultData[<keyof TEntity>field.id] = clone(field.defaultValue);
			else if (field.isArray)
				defaultData[<keyof TEntity>field.id] = <any>[];
		});

		return new this.entityConstructor(defaultData);
	}

	/**
	 * Creates a full model of this Repository's Entity. Any sub-models that need to be fetched from backend will be fetched (if options.availability === DataAvailability.deep).
	 * This method is used internally when modeling entities and value objects, but may be used externally as well, in case an item should be created programmatically from raw data.
	 * @param {TRawData} rawData The raw data for the entity, as it arrives from backend
	 * @param {DataOptions} options
	 * @param {DataQuery} query
	 * @returns {Observable<TEntity extends ModelBase>}
	 */
	createItem(rawData: TRawData, options: DataOptions = { allowCache: true, availability: DataAvailability.available }, query?: DataQuery): Observable<TEntity> {
		return this.paris.modeler.modelEntity<TEntity, TRawData>(rawData, this.modelConfig, options, query);
	}

	/**
	 * Gets multiple items from backend.
	 * The backend may add paging information, such as count, page, etc, so a DataSet object is returned rather than just an Array.
	 *
	 * @example <caption>Get all Todo items</caption>
	 * ```typescript
	 * repository.query()
	 * 		.subscribe((todoItems:DataSet<TodoItem>) => console.log('Current items: ', todoItems.items));
	 * ```
	 *
	 * @example <caption>Get all Todo items, sorted by name</caption>
	 * ```typescript
	 * repository.query({ sortBy: { field: 'name' }})
	 * 		.subscribe((todoItems:DataSet<TodoItem>) => console.log('Items by name: ', todoItems.items));
	 * ```
	 * @param {DataQuery} query
	 * @param {DataOptions} dataOptions
	 * @returns {Observable<DataSet<TEntity extends ModelBase>>}
	 */
	query(query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<TEntity>> {
		if (this.entityConstructor.entityConfig && !this.entityConstructor.entityConfig.supportsGetMethod(EntityGetMethod.query))
			throw new Error(`Can't query ${this.entityConstructor.singularName}, query isn't supported.`);

		return this.paris.callQuery(this.entityConstructor, this.entityBackendConfig, query, dataOptions);
	}

	/**
	 * Same as {@link ReadonlyRepository#query|query}, but returns a single item rather than a {DataSet}.
	 * Useful for when we require to fetch a single model from backend, but it's either a ValueObject (so we can't refer to it by ID) or it's fetched by a more complex data query.
	 * @param {DataQuery} query
	 * @param {DataOptions} dataOptions
	 * @returns {Observable<TEntity extends ModelBase>}
	 */
	queryItem(query: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<TEntity> {
		let httpOptions:HttpOptions = this.getQueryHttpOptions(query);

		let endpoint:string;

		if (this.entityBackendConfig.endpoint instanceof Function)
			endpoint = this.entityBackendConfig.endpoint(this.paris.config, query);
		else
			endpoint = `${this.endpointName}${this.entityBackendConfig.allItemsEndpointTrailingSlash !== false && !this.entityBackendConfig.allItemsEndpoint ? '/' : ''}${this.entityBackendConfig.allItemsEndpoint || ''}`;

		const getItem$:Observable<TEntity> = this.paris.dataStore.get(
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

	/**
	 * Returns the HttpOptions for the specified DataQuery.
	 * Uses the entity config's `parseDataQuery` configuration, if available, or otherwise the `queryToHttpOptions` function.
	 * If the entity config has `fixedData` set, the fixed data will be added to the HttpOptions params.
	 * @param {DataQuery} query
	 * @returns {HttpOptions}
	 */
	getQueryHttpOptions(query:DataQuery):HttpOptions {
		let httpOptions:HttpOptions = this.entityBackendConfig.parseDataQuery ? { params: this.entityBackendConfig.parseDataQuery(query) } : queryToHttpOptions(query);

		if (this.entityBackendConfig.fixedData){
			if (!httpOptions)
				httpOptions = {};

			if (!httpOptions.params)
				httpOptions.params = {};

			Object.assign(httpOptions.params, this.entityBackendConfig.fixedData);
		}

		return httpOptions;
	}

	/**
	 * Clears all cached data in this Repository
	 */
	clearCache():void {
		this.cache.clear();
	}

	/**
	 * Clears the cached values in the Repository, if they were set as a result of using allItems$ or `loadAll: true`.
	 */
	clearAllValues():void {
		this._allValues = null;
	}

	/**
	 * Fetches an item from backend, for the specified ID, or from cache, if it's available.
	 * @param {string | number} itemId
	 * @param {DataOptions} options
	 * @param {{[p: string]: any}} params
	 * @returns {Observable<TEntity extends ModelBase>}
	 */
	getItemById(itemId: EntityId, options: DataOptions = defaultDataOptions, params?:{ [index:string]:any }): Observable<TEntity> {
		if (!this.entityConstructor.entityConfig.supportsGetMethod(EntityGetMethod.getItem))
			throw new Error(`Can't get ${this.entityConstructor.singularName}, getItem isn't supported.`);

		if (this.modelConfig.idField && this.modelConfig.idField.type === Number && typeof(itemId) === "string"){
			let originalItemId = itemId;
			itemId = parseInt(itemId, 10);
			if (isNaN(itemId))
				throw new Error(`Invalid ID for ${this.entity.singularName}. Expected a number but got: ${originalItemId}.`);
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
			const endpoint:string = this.entityBackendConfig.parseItemQuery ? this.entityBackendConfig.parseItemQuery(itemId, this.entity, this.paris.config, params) : `${this.endpointName}/${itemId}`;

			const getItem$:Observable<TEntity> = this.paris.dataStore.get(
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
	 * @param {TEntity} item
	 */
	serializeItem(item:Partial<TEntity>, serializationData?:any): TRawData {
		ReadonlyRepository.validateItem(item, this.entity);

		return this.paris.modeler.serializeModel<TEntity, TRawData>(item, this.entity, serializationData);
	}

	/**
	 * Validates that the specified item is valid, according to the requirements of the entity (or value object) it belongs to.
	 * Meaning, that it can be used as data for creating an instance of T.
	 * @param item
	 * @param {EntityConfigBase} entity
	 * @returns {boolean}
	 */
	static validateItem<TEntity extends ModelBase, TRawData = object>(item:{}, entity:ModelConfig<TEntity, TRawData>):boolean{
		entity.fields.forEach((entityField:Field) => {
			let itemFieldValue: any = (<any>item)[entityField.id];

			if (entityField.required && (itemFieldValue === undefined || itemFieldValue === null))
				throw new Error(`Missing value for field '${entityField.id}'`);
		});

		return true;
	}

	protected emitEntityHttpErrorEvent(err: AjaxError) {
		this._errorSubject$.next({
			entity: this.entityConstructor,
			type: EntityErrorTypes.HttpError,
			originalError: err
		});
	}
}
