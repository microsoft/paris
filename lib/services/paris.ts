import {defaultConfig, ParisConfig} from "../config/paris-config";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Repository} from "../repository/repository";
import {EntityBackendConfig, EntityConfig} from "../entity/entity.config";
import {entitiesService} from "./entities.service";
import {IRepository} from "../repository/repository.interface";
import {DataStoreService} from "./data-store.service";
import {EntityConfigBase} from "../entity/entity-config.base";
import {Observable} from "rxjs/Observable";
import {SaveEntityEvent} from "../events/save-entity.event";
import {Subject} from "rxjs/Subject";
import {RemoveEntitiesEvent} from "../events/remove-entities.event";
import {IRelationshipRepository, RelationshipRepository} from "../repository/relationship-repository";
import {ModelBase} from "../models/model.base";
import {valueObjectsService} from "./value-objects.service";
import {EntityRelationshipRepositoryType} from "../entity/entity-relationship-repository-type";
import {DataSet} from "../dataset/dataset";
import {DataQuery} from "../dataset/data-query";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {ReadonlyRepository} from "../repository/readonly-repository";
import {DatasetService} from "./dataset.service";
import {HttpOptions} from "./http.service";
import {ErrorsService} from "./errors.service";
import {AjaxError} from "rxjs/Rx";
import {EntityErrorEvent, EntityErrorTypes} from "../events/entity-error.event" ;

export class Paris{
	private repositories:Map<DataEntityType, IRepository> = new Map;
	private relationshipRepositories:Map<string, IRelationshipRepository> = new Map;
	readonly dataStore:DataStoreService;
	readonly config:ParisConfig;

	save$:Observable<SaveEntityEvent>;
	private _saveSubject$:Subject<SaveEntityEvent> = new Subject;

	remove$:Observable<RemoveEntitiesEvent>;
	private _removeSubject$:Subject<RemoveEntitiesEvent> = new Subject;

	error$:Observable<EntityErrorEvent>;
	private _errorSubject$:Subject<EntityErrorEvent> = new Subject;

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

	callQuery<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>, backendConfig:EntityBackendConfig, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions):Observable<DataSet<T>>{
		let queryError:Error = new Error(`Failed to get ${entityConstructor.pluralName}.`);
		let httpOptions:HttpOptions = backendConfig.parseDataQuery ? { params: backendConfig.parseDataQuery(query) } : DatasetService.queryToHttpOptions(query);

		if (backendConfig.separateArrayParams) {
			(httpOptions || (httpOptions = {})).separateArrayParams = true;
		}

		if (backendConfig.fixedData){
			if (!httpOptions)
				httpOptions = {};

			if (!httpOptions.params)
				httpOptions.params = {};

			Object.assign(httpOptions.params, backendConfig.fixedData);
		}

		let endpoint:string;
		if (backendConfig.endpoint instanceof Function)
			endpoint = backendConfig.endpoint(this.config, query);
		else
			endpoint = `${backendConfig.endpoint}${backendConfig.allItemsEndpointTrailingSlash !== false && !backendConfig.allItemsEndpoint ? '/' : ''}${backendConfig.allItemsEndpoint || ''}`;

		let baseUrl:string = backendConfig.baseUrl instanceof Function ? backendConfig.baseUrl(this.config) : backendConfig.baseUrl;

		return this.dataStore.get(endpoint, httpOptions, baseUrl)
			.catch((err: AjaxError) => {
				this._errorSubject$.next({
					entity: entityConstructor,
					type: EntityErrorTypes.HttpError,
					originalError: err
				});
				throw err
			})
			.map((rawDataSet: any) => {
				const allItemsProperty = backendConfig.allItemsProperty || "items";

				let rawItems: Array<any> = rawDataSet instanceof Array ? rawDataSet : rawDataSet[allItemsProperty];

				if (!rawItems)
					ErrorsService.warn(`Property '${backendConfig.allItemsProperty}' wasn't found in DataSet for Entity '${entityConstructor.pluralName}'.`);
				return {
					count: rawDataSet.count,
					items: rawItems,
					next: rawDataSet.next,
					previous: rawDataSet.previous
				}
			})
			.flatMap((dataSet: DataSet<any>) => {
				if (!dataSet.items.length)
					return Observable.of({ count: 0, items: [] });

				let itemCreators: Array<Observable<T>> = dataSet.items.map((itemData: any) => this.createItem(entityConstructor, itemData, dataOptions, query));

				return Observable.combineLatest.apply(this, itemCreators).map((items: Array<T>) => {
					return Object.freeze({
						count: dataSet.count,
						items: items,
						next: dataSet.next,
						previous: dataSet.previous
					});
				}).catch((error:Error) => {
					queryError.message = queryError.message + " Error: " + error.message;
					this._errorSubject$.next({
						entity: entityConstructor,
						originalError: queryError.message,
						type: EntityErrorTypes.DataParseError
					});
					throw queryError;
				});
			});
	}

	createItem<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>, data:any, dataOptions: DataOptions = defaultDataOptions, query?:DataQuery):Observable<T>{
		return ReadonlyRepository.getModelData(data, entityConstructor.entityConfig || entityConstructor.valueObjectConfig, this.config, this, dataOptions, query);
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
