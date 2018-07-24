import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";
import {ParisConfig} from "../config/paris-config";
import {DataEntityConstructor} from "./data-entity.base";
import {DataQuery} from "../dataset/data-query";
import {HttpOptions, RequestMethod} from "../services/http.service";
import {ModelBase} from "../models/model.base";
import {ApiCallBackendConfigInterface} from "../models/api-call-backend-config.interface";
import {EntityModelBase} from "../models/entity-model.base";
import {EntityId} from "../models/entity-id.type";

export class ModelEntity<TEntity extends ModelBase<TRawData> = any, TRawData = any> extends EntityConfigBase<TEntity> implements EntityConfig<TEntity, TRawData> {
	endpoint:EntityConfigFunctionOrValue;
	loadAll?:boolean = false;
	cache?:boolean | ModelEntityCacheConfig<TEntity>;
	baseUrl?:EntityConfigFunctionOrValue;
	allItemsProperty?:string;
	allItemsEndpoint?:string;
	allItemsEndpointTrailingSlash?:boolean;
	parseDataQuery?:(dataQuery:DataQuery) => { [index:string]:any };
	parseItemQuery?:(itemId:EntityId, entity?:IEntityConfigBase<TEntity>, config?:ParisConfig, params?:{ [index:string]:any }) => string;
	parseSaveQuery?:(item:TEntity, entity?:IEntityConfigBase, config?:ParisConfig) => string;
	parseRemoveQuery?:(items:Array<TEntity>, entity?:IEntityConfigBase, config?:ParisConfig) => string;
	serializeItem?:(item:TEntity, serializedItem?:any, entity?:IEntityConfigBase, config?:ParisConfig, serializationData?:any) => any;
	getRemoveData?:(items:Array<TEntity>) => any;

	constructor(config:EntityConfig<TEntity, TRawData>, entityConstructor:DataEntityConstructor<TEntity>){
		super(config, entityConstructor);

		this.loadAll = config.loadAll === true;
		if (!this.endpoint && !this.values)
			throw new Error(`Can't create entity ${config.singularName || this.entityConstructor.name}, no endpoint or values defined.`);
	}
}

export interface EntityConfig<
	TEntity extends ModelBase,
	TRawData = any>
	extends IEntityConfigBase<TEntity, TRawData>, EntityBackendConfig<TEntity, TRawData>
{ }

export interface EntityBackendConfig<TEntity extends ModelBase<TRawData>, TRawData = any> extends ApiCallBackendConfigInterface{
	/**
	 * If true, all the Entity's items are fetched whenever any is needed, and then cached so subsequent requests are retrieved from cache rather than backend.
	 * This makes sense to use for Entities whose values are few and not expected to change, such as enums.
	 * @default false
	 */
	loadAll?:boolean,

	/**
	 * When fetching multiple items, Paris expects in the response either an array or an object with an 'items' property, that has an array value.
	 * allItemsProperty can be specified for changing the default 'items' property to whatever your response contains.
	 *
	 * @example
	 * Without allItemsProperty, the data returned from querying your API would have to be either an array or:
	 * {
	 * 		"items": [...]
	 * }
	 *
	 * However, if we set allItemsProperty like this:
	 * {
	 * 		"allItemsProperty": "results"
	 * }
	 *
	 * Then Paris will expect the data to be:
	 * {
	 *		"results: [...]
	 * }
	 *
	 * @default 'items'
	 */
	allItemsProperty?:string,

	/**
	 * Normally, Paris follows the REST standard, and tries to fetch data for an Entity from the given endpoint + '/'. i.e:
	 * If endpoint === 'todo', querying the Entity would result in an HTTP GET from /api/todo/
	 * However, if allItemsEndpoint is set to 'all', the HTTP GET would be from /api/todo/all.
	 */
	allItemsEndpoint?:string,

	/**
	 * Normally, Paris follows the REST standard, and tries to fetch data for an Entity from the given endpoint + '/'. i.e:
	 * If endpoint === 'todo', querying the Entity would result in an HTTP GET from /api/todo/
	 * However, if allItemsEndpointTrailingSlash is set to `false`, the trailing slash is removed and the HTTP GET would be from /api/todo.
	 * @default true
	 */
	allItemsEndpointTrailingSlash?:boolean,

	/**
	 * A function that returns data to send in the request body when `DELETE`ing entities (by using repository.remove).
	 * @param {Array<TEntity extends ModelBase<TRawData>>} items The entities that are removed.
	 */
	getRemoveData?:(items:Array<TEntity>) => any,

	/**
	 * When a `query` is performed, a `DataQuery` object can be specified with options for the query.
	 * `parseDataQuery` receives that DataQuery object and allows to modify it, so Paris can send to the API what it expects.
	 * @param {DataQuery} dataQuery
	 */
	parseDataQuery?:(dataQuery:DataQuery) => { [index:string]:any },

	/**
	 * When getting an Entity from backend (when calling repository.getItemById), Paris follows the REST standard and fetches it by GET from /{the Entity's endpoint}/{ID}.
	 * `parseItemQuery` allows to specify a different URL. This is useful if your API doesn't follow the REST standard.
	 *
	 * @example <caption>Fetching an entity by specifying the ID in a query param rather than as a folder</caption>
	 * parseItemQuery: itemId => `/todo?id=${itemId}`
	 *
	 * @param {EntityId} itemId
	 * @param {IEntityConfigBase} entity
	 * @param {ParisConfig} config
	 * @param {{[p: string]: any}} params
	 * @returns {string}
	 */
	parseItemQuery?:(itemId:EntityId, entity?:IEntityConfigBase, config?:ParisConfig, params?:{ [index:string]:any }) => string,

	/**
	 * Similar to `parseDataQuery`, but for a `save` call, rather than `getItemById`. Use it to specify the URL to use when creating or updating an Entity.
	 * @param {TEntity} item
	 * @param {IEntityConfigBase} entity
	 * @param {ParisConfig} config
	 * @param {HttpOptions} options
	 * @returns {string}
	 */
	parseSaveQuery?:(item:TEntity, entity?:IEntityConfigBase, config?:ParisConfig, options?: HttpOptions) => string,

	/**
	 * Similar to `parseDataQuery`, but for a `remove` call, rather than `getItemById`. Use it to specify the URL to use when removing entities.
	 * @param {Array<TEntity extends ModelBase<TRawData>>} items
	 * @param {IEntityConfigBase} entity
	 * @param {ParisConfig} config
	 * @returns {string}
	 */
	parseRemoveQuery?:(items:Array<TEntity>, entity?:IEntityConfigBase, config?:ParisConfig) => string,

	/**
	 * Set the saveMethod of an Entity to determine the HTTP method to use in the request to the backend when saving an entity.
	 * Since this can be either a function or one of the `RequestMethod`s, the method can be either hardcoded for all `save` calls of this Entity, or determined at runtime for each call.
	 * For example, you might want to use POST instead of Paris' default PUT when updating an existing entity, or you might want to use PATCH instead.
	 */
	saveMethod?:((item:TEntity, config?:ParisConfig) => RequestMethod) | RequestMethod,

	/**
	 * If the HTTP request takes longer than this number (milliseconds), the request will fail with status 0.
	 * @default 60000
	 */
	timeout?:number
}

export interface ModelEntityCacheConfig<T extends ModelBase = any>{
	time?: ((item:T) => number) | number,
	max?: number
}

export type EntityConfigFunctionOrValue = ((config?:ParisConfig, query?:DataQuery) => string) | string;
