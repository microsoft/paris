import * as jsonStringify from 'json-stringify-safe';
import { clone } from "lodash-es";
import { Observable, of, Subject, throwError } from "rxjs";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { ApiCallType } from "./api/api-calls/api-call.model";
import { DataEntityType } from "./api/entity/data-entity.base";
import { EntityRelationshipRepositoryType } from "./api/entity/entity-relationship-repository-type";
import { EntityErrorEvent, EntityErrorTypes } from "./api/events/entity-error.event";
import { RemoveEntitiesEvent } from "./api/events/remove-entities.event";
import { SaveEntityEvent } from "./api/events/save-entity.event";
import { ReadonlyRepository } from "./api/repository/readonly-repository";
import { IRelationshipRepository, RelationshipRepository } from "./api/repository/relationship-repository";
import { Repository } from "./api/repository/repository";
import { IRepository } from "./api/repository/repository.interface";
import { ApiCallBackendConfigInterface } from "./config/api-call-backend-config.interface";
import { EntityModelBase } from "./config/entity-model.base";
import { EntityBackendConfig, EntityConfig } from "./config/entity.config";
import { EntityConfigBase } from "./config/model-config";
import { ModelBase } from "./config/model.base";
import { defaultConfig, ParisConfig } from "./config/paris-config";
import { entitiesService } from "./config/services/entities.service";
import { valueObjectsService } from "./config/services/value-objects.service";
import { DataCache, DataCacheSettings } from "./data_access/cache";
import { DataQuery } from "./data_access/data-query";
import { DataStoreService } from "./data_access/data-store.service";
import { DataOptions, defaultDataOptions } from "./data_access/data.options";
import { DataSet } from "./data_access/dataset";
import { HttpOptions, RequestMethod, UrlParams } from "./data_access/http.service";
import { queryToHttpOptions } from "./data_access/query-to-http";
import { DataTransformersService } from "./modeling/data-transformers.service";
import { EntityId } from "./modeling/entity-id.type";
import { Modeler } from "./modeling/modeler";
import {AjaxRequest} from "rxjs/ajax";

export class Paris<TConfigData = any> {
	private readonly repositories:Map<DataEntityType, IRepository<ModelBase>> = new Map;
	private readonly relationshipRepositories:Map<string, IRelationshipRepository<ModelBase>> = new Map;
	readonly modeler:Modeler;

	readonly dataStore:DataStoreService;
	readonly config:ParisConfig<TConfigData>;

	/**
	 * Observable that fires whenever an {@link Entity} is saved
	 */
	readonly save$:Observable<SaveEntityEvent>;
	private readonly _saveSubject$:Subject<SaveEntityEvent> = new Subject;

	/**
	 * Observable that fires whenever an {@link Entity} is removed
	 */
	readonly remove$:Observable<RemoveEntitiesEvent>;
	private readonly _removeSubject$:Subject<RemoveEntitiesEvent> = new Subject;

	/**
	 * Observable that fires whenever there is an error in Paris.
	 * Relevant both to errors parsing data and to HTTP errors
	 */
	readonly error$:Observable<EntityErrorEvent>;
	private readonly _errorSubject$:Subject<EntityErrorEvent> = new Subject;

	private readonly apiCallsCache:Map<ApiCallType, DataCache> = new Map<ApiCallType, DataCache>();

	constructor(config?:ParisConfig<TConfigData>){
		this.config = Object.freeze(Object.assign({}, defaultConfig, config));
		this.dataStore = new DataStoreService(this.config);
		this.modeler = new Modeler(this);

		this.save$ = this._saveSubject$.asObservable();
		this.remove$ = this._removeSubject$.asObservable();
		this.error$ = this._errorSubject$.asObservable();
	}

	/**
	 * Returns the {@link Repository} for the specified class. If no Repository can be found, returns null.
	 * @param {DataEntityType<TEntity extends ModelBase>} entityConstructor A class, should have a decorator of either @Entity or @ValueObject.
	 */
	getRepository<TEntity extends ModelBase>(entityConstructor:DataEntityType<TEntity>):Repository<TEntity> | null{
		let repository:Repository<TEntity> = <Repository<TEntity>>this.repositories.get(entityConstructor);
		if (!repository) {
			let entityConfig:EntityConfig<TEntity> = entitiesService.getEntityByType(entityConstructor) || valueObjectsService.getEntityByType(entityConstructor);
			if (!entityConfig)
				return null;

			repository = new Repository<TEntity>(entityConstructor, this);
			this.repositories.set(entityConstructor, repository);

			// If the entity has an endpoint, it means it connects to the backend, so subscribe to save/delete events to enable global events:
			if (entityConfig.endpoint){
				repository.save$.subscribe((saveEvent:SaveEntityEvent) => this._saveSubject$.next(saveEvent));
				repository.remove$.subscribe((removeEvent:RemoveEntitiesEvent) => this._removeSubject$.next(removeEvent));
				repository.error$.subscribe((error) => this._errorSubject$.next(error))
			}
		}

		return repository;
	}

	/**
	 * Returns a {@link RelationshipRepository} for the specified relationship class.
	 * @param {Function} relationshipConstructor Class that has a @EntityRelationship decorator
	 */
	getRelationshipRepository<T extends ModelBase, U extends ModelBase>(relationshipConstructor:Function):RelationshipRepository<T, U>{
		const relationship:EntityRelationshipRepositoryType<T, U> = <EntityRelationshipRepositoryType<T, U>>relationshipConstructor;

		let sourceEntityName:string = relationship.sourceEntityType.singularName.replace(/\s/g, ""),
			dataEntityName:string = relationship.dataEntityType.singularName.replace(/\s/g, "");

		let relationshipId:string = `${sourceEntityName}_${dataEntityName}`;

		let repository:RelationshipRepository<T, U> = <RelationshipRepository<T, U>>this.relationshipRepositories.get(relationshipId);
		if (!repository) {
			repository = new RelationshipRepository<T, U>(relationship.sourceEntityType, relationship.dataEntityType, relationship.allowedTypes, this);
			this.relationshipRepositories.set(relationshipId, repository);
		}

		return repository;
	}

	/**
	 * Returns the configuration for the specified Entity/ValueObject class, if the specified class is indeed one of those.
	 * @param {DataEntityType} entityConstructor
	 */
	getModelBaseConfig(entityConstructor:DataEntityType):EntityConfigBase{
		return entityConstructor.entityConfig || entityConstructor.valueObjectConfig;
	}

	/**
	 * Fetches multiple item data from backend
	 * @param {DataEntityType<TEntity extends ModelBase>} entityConstructor The {@link Entity} class for which to fetch data
	 * @param {DataQuery} query {@link DataQuery} object with configuration for the backend API, such as page, page size, order, or any custom data required
	 * @param {DataOptions} dataOptions General options for the query.
	 * @returns {Observable<DataSet<TEntity extends ModelBase>>} An Observable of DataSet<TEntity>
	 */
	query<TEntity extends ModelBase>(entityConstructor:DataEntityType<TEntity>, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<TEntity>>{
		let repository:Repository<TEntity> = this.getRepository(entityConstructor);
		if (repository)
			return repository.query(query, dataOptions);
		else
			throw new Error(`Can't query, no repository exists for ${entityConstructor}.`);
	}

	/**
	 * Calls a backend API, which is defined by an ApiCallType.
	 * @param {ApiCallType<TResult, TInput>} apiCallType The class which defines the ApiCallType. Should be decorated with @ApiCall and extend {@link ApiCallModel}.
	 * @param {TInput} input Any data required to be sent to the backend in the API call
	 * @param {DataOptions} dataOptions General options for the call
	 * @returns {Observable<TResult>} An Observable of the api call's result data type
	 */
	apiCall<TResult = any, TInput = any>(apiCallType:ApiCallType<TResult, TInput>, input?:TInput, dataOptions:DataOptions = defaultDataOptions):Observable<TResult>{
		const cacheKey:string = jsonStringify(input || {});

		if (dataOptions.allowCache) {
			const apiCallTypeCache: DataCache<TResult> = this.getApiCallCache<TResult, TInput>(apiCallType);
			if (apiCallTypeCache) {
				return apiCallTypeCache.get(cacheKey).pipe(
					switchMap((value:TResult) => value !== undefined && value !== null
						? of(value)
						: this.apiCall(apiCallType, input, { ...dataOptions, allowCache: false })
					)
				);
			}
		}

		let httpOptions: HttpOptions = ((input !== undefined) && (input !== null))
			? apiCallType.config.parseQuery
				? apiCallType.config.parseQuery(input)
				: apiCallType.config.method !== "GET" ? {data: input} : {params: input}
			: null;
		if (!httpOptions){
			httpOptions = {};
		}

		if (apiCallType.config.customHeaders !== undefined){
			httpOptions.customHeaders =  apiCallType.config.customHeaders instanceof Function ? apiCallType.config.customHeaders(input, this.config) : apiCallType.config.customHeaders;
		}

		const requestOptions: AjaxRequest = apiCallType.config.responseType ? {responseType: apiCallType.config.responseType} : null;

		let apiCall$: Observable<any> = this.makeApiCall(
			apiCallType.config,
			apiCallType.config.method || "GET",
			httpOptions,
			undefined,
			requestOptions)
			.pipe(
				catchError((err: EntityErrorEvent) => {
					this._errorSubject$.next(err);
					return throwError(err.originalError || err)
				}));

		let typeRepository: ReadonlyRepository<TResult> = apiCallType.config.type
			? this.getRepository(apiCallType.config.type)
			: null;

		if (typeRepository) {
			apiCall$ = apiCall$.pipe(
				mergeMap((data: any) => {
						const createItem$: Observable<TResult | Array<TResult>> = data instanceof Array
							? this.modeler.modelArray<TResult>(data, apiCallType.config.type, dataOptions)
							: this.createItem<TResult>(apiCallType.config.type, data, dataOptions);
						return createItem$.pipe(
							tap(null,
								(err) => {
									this._errorSubject$.next({
										originalError: err,
										type: EntityErrorTypes.DataParseError,
										entity: typeRepository.entityConstructor
									})
								})
						)
					}
				)
			);
		}
		else if (apiCallType.config.type){
			apiCall$ = apiCall$.pipe(
				map((data:any) => {
					try {
						return DataTransformersService.parse(apiCallType.config.type, data)
					}
					catch (err) {
						this._errorSubject$.next({
							originalError: err.originalError || err,
							type: EntityErrorTypes.DataParseError,
							entity: typeRepository && typeRepository.entityConstructor
						});
						throw err;
					}
				})
			);
		}

		if (apiCallType.config.parse) {
			apiCall$ = apiCall$.pipe(
				map((data: any) => {
					try {
						return apiCallType.config.parse(data, input)
					}
					catch (err) {
						this._errorSubject$.next({
							originalError: err.originalError || err,
							type: EntityErrorTypes.DataParseError,
							entity: typeRepository && typeRepository.entityConstructor
						});
						throw err;
					}
				})
			);
		}

		if (apiCallType.config.cache){
			apiCall$ = apiCall$.pipe(
				tap((data:any) => {
					this.getApiCallCache(apiCallType, true).add(cacheKey, data);
				})
			);
		}

		return apiCall$;
	}

	private getApiCallCache<TResult, TInput>(apiCallType:ApiCallType<TResult, TInput>, addIfNotExists:boolean = false):DataCache<TResult>{
		let apiCallCache:DataCache<TResult> = this.apiCallsCache.get(apiCallType);
		if (!apiCallCache && addIfNotExists){
			let cacheSettings:DataCacheSettings = apiCallType.config.cache instanceof Object ? <DataCacheSettings>apiCallType.config.cache : null;
			this.apiCallsCache.set(apiCallType, apiCallCache = new DataCache<TResult>(cacheSettings));
		}

		return apiCallCache;
	}

	private makeApiCall<TResult, TParams = UrlParams, TData = any, TRawDataResult = TResult>(backendConfig:ApiCallBackendConfigInterface<TResult, TRawDataResult>, method:RequestMethod, httpOptions:Readonly<HttpOptions<TData, TParams>>, query?: DataQuery, requestOptions?: AjaxRequest):Observable<TResult>{
		const dataQuery: DataQuery = query || { where: httpOptions && httpOptions.params };
		let endpoint:string;
		if (backendConfig.endpoint instanceof Function)
			endpoint = backendConfig.endpoint(this.config, dataQuery);
		else if (backendConfig.endpoint)
			endpoint = backendConfig.endpoint;
		else
			throw new Error(`Can't call API, no endpoint specified.`);

		const baseUrl:string = backendConfig.baseUrl instanceof Function ? backendConfig.baseUrl(this.config, dataQuery) : backendConfig.baseUrl;
		let apiCallHttpOptions:HttpOptions<TData> = clone(httpOptions) || {};

		if (backendConfig.separateArrayParams) {
			apiCallHttpOptions.separateArrayParams = true;
		}

		if (backendConfig.fixedData){
			if (!apiCallHttpOptions.params)
				apiCallHttpOptions.params = <TParams>{};

			Object.assign(apiCallHttpOptions.params, backendConfig.fixedData);
		}

		const self = this;
		function makeRequest$<T>(): Observable<T> {
			return self.dataStore.request<T>(method || "GET", endpoint, apiCallHttpOptions, baseUrl, requestOptions).pipe(
				catchError(err => {
					return throwError({
						originalError: err,
						type: EntityErrorTypes.HttpError,
						entity: null
					})
				}))
		}

		if (backendConfig.parseData) {
			return makeRequest$<TRawDataResult>().pipe(
				map((rawData: TRawDataResult) => {
					try {
						return backendConfig.parseData(rawData, this.config, dataQuery)
					} catch (err) {
						throw {
							originalError: err,
							type: EntityErrorTypes.DataParseError,
							entity: null
						}
					}
				}),
			);
		}

		return makeRequest$<TResult>()
	}

	/**
	 * Underlying method for {@link query}. Different in that it accepts an {@link EntityBackendConfig}, to configure the call.
	 * @param {DataEntityType<TEntity extends ModelBase>} entityConstructor
	 * @param {EntityBackendConfig} backendConfig
	 * @param {DataQuery} query
	 * @param {DataOptions} dataOptions
	 * @returns {Observable<DataSet<TEntity extends ModelBase>>}
	 */
	callQuery<TEntity extends ModelBase>(entityConstructor:DataEntityType<TEntity>, backendConfig:EntityBackendConfig<TEntity>, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions):Observable<DataSet<TEntity>>{
		let httpOptions:HttpOptions = backendConfig.parseDataQuery ? { params: backendConfig.parseDataQuery(query) } : queryToHttpOptions(query);
		if (!httpOptions){
			httpOptions = {};
		}
		if (backendConfig.customHeaders !== undefined){
			httpOptions.customHeaders =  backendConfig.customHeaders instanceof Function ? backendConfig.customHeaders(query, this.config) : backendConfig.customHeaders;
		}
		const endpoint:string = backendConfig.endpoint instanceof Function ? backendConfig.endpoint(this.config, query) : backendConfig.endpoint;

		const apiCallConfig:ApiCallBackendConfigInterface = Object.assign({}, backendConfig, {
			endpoint: `${endpoint}${backendConfig.allItemsEndpointTrailingSlash !== false && !backendConfig.allItemsEndpoint ? '/' : ''}${backendConfig.allItemsEndpoint || ''}`
		});

		return this.makeApiCall<TEntity>(apiCallConfig, "GET", httpOptions, query).pipe(
			catchError((error: EntityErrorEvent) => {
					this._errorSubject$.next(Object.assign({}, error, {entity: entityConstructor}));
					return throwError(error.originalError || error)
				}),
			mergeMap((rawDataSet: TEntity) => {
				return this.modeler.rawDataToDataSet<TEntity>(
					rawDataSet,
					entityConstructor,
					backendConfig.allItemsProperty || this.config.allItemsProperty,
					dataOptions,
					query
				).pipe(
					tap(null,
						(error) => {
							this._errorSubject$.next({
								originalError: error,
								type: EntityErrorTypes.DataParseError,
								entity: entityConstructor
							});
						}
					)
				)
			}),
		);
	}

	/**
	 * Creates an instance of a model - given an Entity/ValueObject class and data, creates a root model, with full model tree, meaning - all sub-models are modeled as well.
	 * Sub-models that require being fetched from backend will be fetched.
	 * @param {DataEntityType<TEntity extends ModelBase>} entityConstructor
	 * @param data {TRawData} The raw JSON data for creating the item, as it arrives from backend.
	 * @param {DataOptions} dataOptions
	 * @param {DataQuery} query
	 */
	createItem<TEntity extends ModelBase, TRawData extends any = object>(entityConstructor:DataEntityType<TEntity>, data:TRawData, dataOptions: DataOptions = defaultDataOptions, query?:DataQuery):Observable<TEntity>{
		return this.modeler.modelEntity<TEntity, TRawData>(data, entityConstructor.entityConfig || entityConstructor.valueObjectConfig, dataOptions, query);
	}

	/**
	 * Gets an item by ID from backend and returns an Observable with the model
	 *
	 * @example <caption>Get a TodoItem with ID 1</caption>
	 * ```typescript
	 * const toDo$:Observable<TodoItem> = paris.getItemById<TodoItem>(TodoItem, 1);
	 * toDo$.subscribe((toDo:TodoItem) => console.log('Found TodoItem item: ', toDo);
	 * ```
	 * @param {DataEntityType<TEntity extends ModelBase>} entityConstructor
	 * @param {string | number} itemId
	 * @param {DataOptions} options
	 * @param {{[p: string]: any}} params
	 * @returns {Observable<TEntity extends ModelBase>}
	 */
	getItemById<TEntity extends EntityModelBase<TId>, TId extends EntityId, TTId extends TId>(entityConstructor:DataEntityType<TEntity, any, TId>, itemId: TTId, options?:DataOptions, params?:{ [index:string]:any }): Observable<TEntity>{
		options = options || defaultDataOptions;

		const repository:Repository<TEntity> = this.getRepository(entityConstructor);
		if (repository)
			return repository.getItemById(itemId, options, params);
		else
			throw new Error(`Can't get item by ID, no repository exists for ${entityConstructor}.`);
	}

	/**
	 * Gets all the items for an entity type. If all the items are cached, no backend call shall be performed (as in the case the the Entity is configured with `loadAll: true` and has already fetched data).
	 * @param {DataEntityType<TEntity extends EntityModelBase>} entityConstructor
	 * @returns {Observable<Array<TEntity extends EntityModelBase>>}
	 */
	allItems<TEntity extends EntityModelBase<TId>, TId extends EntityId>(entityConstructor:DataEntityType<TEntity, any, TId>):Observable<Array<TEntity>>{
		const repository:Repository<TEntity> = this.getRepository(entityConstructor);
		if (repository)
			return repository.allItems$;
		else
			throw new Error(`Can't get all items, no repository exists for ${entityConstructor}.`);
	}

	/**
	 * Query items in a relationship - fetches multiple items that relate to a specified item.
	 *
	 * @example <caption>Get all the TodoItem items in a TodoList</caption>
	 *
	 * ```typescript
	 * const toDoListId = 1;
	 * const toDoList$:Observable<TodoList> = paris.getItemById(TodoList, toDoListId);
	 *
	 * const toDoListItems$:Observable<DataSet<TodoItem>> = toDoList$.pipe(
	 * 	mergeMap((toDoList:TodoList) => paris.queryForItem<TodoList, Todo>(TodoListItemsRelationship, toDoList))
	 * );
	 *
	 * toDoListItems$.subscribe((toDoListItems:DataSet<TodoItem>) => console.log(`Items in TodoList #${toDoListId}:`, toDoListItems.items));
	 * ```
	 * @param {Function} relationshipConstructor
	 * @param {ModelBase} item
	 * @param {DataQuery} query
	 * @param {DataOptions} dataOptions
	 * @returns {Observable<DataSet<U extends ModelBase>>}
	 */
	queryForItem<TSource extends ModelBase, TResult extends ModelBase>(relationshipConstructor:Function, item:TSource, query?: DataQuery, dataOptions?:DataOptions): Observable<DataSet<TResult>>{
		dataOptions = dataOptions || defaultDataOptions;

		let relationshipRepository:RelationshipRepository<TSource,TResult> = this.getRelationshipRepository<TSource, TResult>(relationshipConstructor);
		if (relationshipRepository)
			return relationshipRepository.queryForItem(item, query, dataOptions);
		else
			throw new Error(`Can't query for related item, no relationship repository exists for ${relationshipConstructor}.`);
	}

	/**
	 * Gets an item that's related to another item, as defined in a relationship.
	 *
	 * @example <caption>Get an item for another item</caption>
	 * ```typescript
	 * const toDoListId = 1;
	 * const toDoList$:Observable<TodoList> = paris.getItemById(TodoList, toDoListId);
	 *
	 * const toDoListHistory$:Observable<ToDoListHistory> = toDoList$.pipe(
	 * 	mergeMap((toDoList:TodoList) => paris.getRelatedItem<TodoList, ToDoListHistory>(TodoListItemsRelationship, toDoList))
	 * );
	 *
	 * toDoListHistory$.subscribe((toDoListHistory$:ToDoListHistory) => console.log(`History for TodoList #${toDoListId}:`, toDoListHistory));
	 * ```
	 * @param {Function} relationshipConstructor
	 * @param {ModelBase} item
	 * @param {DataQuery} query
	 * @param {DataOptions} dataOptions
	 * @returns {Observable<U extends ModelBase>}
	 */
	getRelatedItem<TSource extends ModelBase, TResult extends ModelBase>(relationshipConstructor:Function, item:TSource, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<TResult>{
		let relationshipRepository:RelationshipRepository<TSource,TResult> = this.getRelationshipRepository<TSource, TResult>(relationshipConstructor);
		if (relationshipRepository)
			return relationshipRepository.getRelatedItem(item, query, dataOptions);
		else
			throw new Error(`Can't get related item, no relationship repository exists for ${relationshipConstructor}.`);
	}

	/**
	 * Gets an entity value by its ID. The value has to be defined in the Entity's values property
	 *
	 * @example <caption>Get the value with id === 'open' from Entity ToDoStatus</caption>
	 * ```typescript
	 * const openStatusId = 'open';
	 * const toDoStatus = paris.getValue(ToDoStatus, openStatusId);
	 *
	 * console.log("TodoItem 'open' status: ", toDoStatus);
	 * ```
	 * @param {DataEntityType<TEntity extends ModelBase>} entityConstructor
	 * @param valueId
	 * @returns {TEntity}
	 */
	getValue<TEntity extends ModelBase, TId extends EntityId>(entityConstructor:DataEntityType<TEntity, any, TId>, valueId:TId | ((value:TEntity) => boolean)):TEntity {
		let repository:Repository<TEntity> = this.getRepository(entityConstructor);
		if (!repository)
			return null;

		let values:Array<TEntity> = repository.entity.values;
		if (!values)
			return null;

		if (valueId instanceof Function){
			for(let i=0, value; value = values[i]; i++){
				if (valueId(value))
					return value;
			}

			return null;
		}
		else
			return repository.entity.getValueById(valueId);
	}
}
