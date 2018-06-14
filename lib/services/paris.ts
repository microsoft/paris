import {defaultConfig, ParisConfig} from "../config/paris-config";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Repository} from "../repository/repository";
import {EntityBackendConfig, EntityConfig} from "../entity/entity.config";
import {entitiesService} from "./entities.service";
import {IRepository} from "../repository/repository.interface";
import {DataStoreService} from "./data-store.service";
import {EntityConfigBase} from "../entity/entity-config.base";
import {Observable, of, Subject, throwError} from "rxjs";
import {SaveEntityEvent} from "../events/save-entity.event";
import {RemoveEntitiesEvent} from "../events/remove-entities.event";
import {IRelationshipRepository, RelationshipRepository} from "../repository/relationship-repository";
import {ModelBase} from "../models/model.base";
import {valueObjectsService} from "./value-objects.service";
import {EntityRelationshipRepositoryType} from "../entity/entity-relationship-repository-type";
import {DataSet} from "../dataset/dataset";
import {DataQuery} from "../dataset/data-query";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {ReadonlyRepository} from "../repository/readonly-repository";
import {queryToHttpOptions} from "../dataset/query-to-http";
import {HttpOptions, RequestMethod, UrlParams} from "./http.service";
import {EntityErrorEvent, EntityErrorTypes} from "../events/entity-error.event";
import {ApiCallType} from "../models/api-call.model";
import {ApiCallBackendConfigInterface} from "../models/api-call-backend-config.interface";
import {modelArray, rawDataToDataSet} from "../repository/data-to-model";
import {catchError, map, mergeMap, switchMap, tap} from "rxjs/operators";
import {DataTransformersService} from "./data-transformers.service";
import {DataCache, DataCacheSettings} from "./cache";
import * as _ from "lodash";

export class Paris{
	private repositories:Map<DataEntityType, IRepository<ModelBase>> = new Map;
	private relationshipRepositories:Map<string, IRelationshipRepository<ModelBase>> = new Map;
	readonly dataStore:DataStoreService;
	readonly config:ParisConfig;

	save$:Observable<SaveEntityEvent>;
	private _saveSubject$:Subject<SaveEntityEvent> = new Subject;

	remove$:Observable<RemoveEntitiesEvent>;
	private _removeSubject$:Subject<RemoveEntitiesEvent> = new Subject;

	error$:Observable<EntityErrorEvent>;
	private _errorSubject$:Subject<EntityErrorEvent> = new Subject;

	private apiCallsCache:Map<ApiCallType, DataCache> = new Map<ApiCallType, DataCache>();

	constructor(config?:ParisConfig){
		this.config = Object.freeze(Object.assign({}, defaultConfig, config));
		this.dataStore = new DataStoreService(this.config);

		this.save$ = this._saveSubject$.asObservable();
		this.remove$ = this._removeSubject$.asObservable();
		this.error$ = this._errorSubject$.asObservable();
	}

	getRepository<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>):Repository<T> | null{
		let repository:Repository<T> = <Repository<T>>this.repositories.get(entityConstructor);
		if (!repository) {
			let entityConfig:EntityConfig = entitiesService.getEntityByType(entityConstructor) || valueObjectsService.getEntityByType(entityConstructor);
			if (!entityConfig)
				return null;

			repository = new Repository<T>(entityConfig, this.config, entityConstructor, this.dataStore, this);
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

	getRelationshipRepository<T extends ModelBase, U extends ModelBase>(relationshipConstructor:Function):RelationshipRepository<T, U>{
		const relationship:EntityRelationshipRepositoryType<T, U> = <EntityRelationshipRepositoryType<T, U>>relationshipConstructor;

		let sourceEntityName:string = relationship.sourceEntityType.singularName.replace(/\s/g, ""),
			dataEntityName:string = relationship.dataEntityType.singularName.replace(/\s/g, "");

		let relationshipId:string = `${sourceEntityName}_${dataEntityName}`;

		let repository:RelationshipRepository<T, U> = <RelationshipRepository<T, U>>this.relationshipRepositories.get(relationshipId);
		if (!repository) {
			repository = new RelationshipRepository<T, U>(relationship.sourceEntityType, relationship.dataEntityType, relationship.allowedTypes, this.config, this.dataStore, this);
			this.relationshipRepositories.set(relationshipId, repository);
		}

		return repository;
	}

	getModelBaseConfig(entityConstructor:DataEntityType):EntityConfigBase{
		return entityConstructor.entityConfig || entityConstructor.valueObjectConfig;
	}

	query<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<T>>{
		let repository:Repository<T> = this.getRepository(entityConstructor);
		if (repository)
			return repository.query(query, dataOptions);
		else
			throw new Error(`Can't query, no repository exists for ${entityConstructor}.`);
	}

	apiCall<TResult = any, TInput = any>(apiCallType:ApiCallType<TResult, TInput>, input?:TInput, dataOptions:DataOptions = defaultDataOptions, allowCache:boolean = true):Observable<TResult>{
		const cacheKey:string = JSON.stringify(input) || "{}";

		if (allowCache) {
			const apiCallTypeCache: DataCache<TResult> = this.getApiCallCache<TResult, TInput>(apiCallType);
			if (apiCallTypeCache) {
				return apiCallTypeCache.get(cacheKey).pipe(
					switchMap((value:TResult) => value !== undefined && value !== null
						? of(value)
						: this.apiCall(apiCallType, input, dataOptions, false)
					)
				);
			}
		}

		const httpOptions:HttpOptions = input
			? apiCallType.config.parseQuery
				? apiCallType.config.parseQuery(input)
				: apiCallType.config.method !== "GET" ? { data: input } : { params: input }
			: null;

		let apiCall$: Observable<any> = this.makeApiCall(apiCallType.config, apiCallType.config.method || "GET", httpOptions)
			.pipe(
				catchError((err: EntityErrorEvent) => {
					this._errorSubject$.next(err);
					return throwError(err.originalError || err)
				}));

		let typeRepository:ReadonlyRepository<TResult> = apiCallType.config.type
			? this.getRepository(apiCallType.config.type)
			: null;

		if (typeRepository) {
			apiCall$ = apiCall$.pipe(
				mergeMap<any, TResult | Array<TResult>>((data: any) => {
						const createItem$: Observable<TResult | Array<TResult>> = data instanceof Array
							? modelArray<TResult>(data, apiCallType.config.type, this, dataOptions)
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

	private makeApiCall<TResult, TParams = UrlParams, TData = any, TRawDataResult = TResult>(backendConfig:ApiCallBackendConfigInterface<TResult, TRawDataResult>, method:RequestMethod, httpOptions:Readonly<HttpOptions<TData, TParams>>, query?: DataQuery):Observable<TResult>{
		const dataQuery: DataQuery = query || { where: httpOptions && httpOptions.params };
		let endpoint:string;
		if (backendConfig.endpoint instanceof Function)
			endpoint = backendConfig.endpoint(this.config, dataQuery);
		else if (backendConfig.endpoint)
			endpoint = backendConfig.endpoint;
		else
			throw new Error(`Can't call API, no endpoint specified.`);

		const baseUrl:string = backendConfig.baseUrl instanceof Function ? backendConfig.baseUrl(this.config, dataQuery) : backendConfig.baseUrl;
		let apiCallHttpOptions:HttpOptions<TData> = _.clone(httpOptions) || {};

		if (backendConfig.separateArrayParams) {
			apiCallHttpOptions.separateArrayParams = true;
		}

		if (backendConfig.fixedData){
			if (!apiCallHttpOptions.params)
				apiCallHttpOptions.params = <TParams>{};

			Object.assign(apiCallHttpOptions.params, backendConfig.fixedData);
		}

		if (backendConfig.parseData) {
			return this.dataStore.request<TRawDataResult>(method || "GET", endpoint, apiCallHttpOptions, baseUrl).pipe(
				catchError(err => {
					return throwError({
						originalError: err,
						type: EntityErrorTypes.HttpError,
						entity: null
					})
				}),
				map((rawData: TRawDataResult) => {
					try {
						return backendConfig.parseData(rawData, this.config, dataQuery)
					}
					catch (err) {
						throw {
							originalError: err,
							type: EntityErrorTypes.DataParseError,
							entity: null
						}
					}
				}),
			);
		}

		return this.dataStore.request<TResult>(method || "GET", endpoint, apiCallHttpOptions, baseUrl).pipe(
			catchError(err => {
				return throwError({
					originalError: err,
					type: EntityErrorTypes.HttpError,
					entity: null
				})
			}),
		)
	}

	callQuery<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>, backendConfig:EntityBackendConfig, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions):Observable<DataSet<T>>{
		const httpOptions:HttpOptions = backendConfig.parseDataQuery ? { params: backendConfig.parseDataQuery(query) } : queryToHttpOptions(query);

		const endpoint:string = backendConfig.endpoint instanceof Function ? backendConfig.endpoint(this.config, query) : backendConfig.endpoint;

		const apiCallConfig:ApiCallBackendConfigInterface = Object.assign({}, backendConfig, {
			endpoint: `${endpoint}${backendConfig.allItemsEndpointTrailingSlash !== false && !backendConfig.allItemsEndpoint ? '/' : ''}${backendConfig.allItemsEndpoint || ''}`
		});

		return this.makeApiCall<T>(apiCallConfig, "GET", httpOptions, query).pipe(
			catchError((error: EntityErrorEvent) => {
					this._errorSubject$.next(Object.assign({}, error, {entity: entityConstructor}));
					return throwError(error.originalError || error)
				}),
			mergeMap((rawDataSet: T) => {
				return rawDataToDataSet<T>(
					rawDataSet,
					entityConstructor,
					backendConfig.allItemsProperty || this.config.allItemsProperty,
					this,
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

	createItem<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>, data:any, dataOptions: DataOptions = defaultDataOptions, query?:DataQuery):Observable<T>{
		return ReadonlyRepository.getModelData<T>(data, entityConstructor.entityConfig || entityConstructor.valueObjectConfig, this.config, this, dataOptions, query);
	}

	getItemById<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>, itemId: string | number, options?:DataOptions, params?:{ [index:string]:any }): Observable<T>{
		options = options || defaultDataOptions;

		let repository:Repository<T> = this.getRepository(entityConstructor);
		if (repository)
			return repository.getItemById(itemId, options, params);
		else
			throw new Error(`Can't get item by ID, no repository exists for ${entityConstructor}.`);
	}

	queryForItem<T extends ModelBase, U extends ModelBase>(relationshipConstructor:Function, item:ModelBase, query?: DataQuery, dataOptions?:DataOptions): Observable<DataSet<U>>{
		dataOptions = dataOptions || defaultDataOptions;

		let relationshipRepository:RelationshipRepository<T,U> = this.getRelationshipRepository<T, U>(relationshipConstructor);
		if (relationshipRepository)
			return relationshipRepository.queryForItem(item, query, dataOptions);
		else
			throw new Error(`Can't query for related item, no relationship repository exists for ${relationshipConstructor}.`);
	}

	getRelatedItem<T extends ModelBase, U extends ModelBase>(relationshipConstructor:Function, item:ModelBase, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<U>{
		let relationshipRepository:RelationshipRepository<T,U> = this.getRelationshipRepository<T, U>(relationshipConstructor);
		if (relationshipRepository)
			return relationshipRepository.getRelatedItem(item, query, dataOptions);
		else
			throw new Error(`Can't get related item, no relationship repository exists for ${relationshipConstructor}.`);
	}

	getValue<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>, valueId:any):T{
		let repository:Repository<T> = this.getRepository(entityConstructor);
		if (!repository)
			return null;

		let values:Array<T> = repository.entity.values;
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
