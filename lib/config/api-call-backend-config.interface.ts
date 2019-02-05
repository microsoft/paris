import {EntityConfigFunctionOrValue} from "./entity.config";
import {ParisConfig} from "./paris-config";
import {DataCacheSettings} from "../data_access/cache";
import {DataQuery} from "../data_access/data-query";

export interface ApiCallBackendConfigInterface<T = any, TRawData = any>{
	/**
	 * The URL to use for HTTP requests.
	 */
	endpoint?:EntityConfigFunctionOrValue,

	/**
	 * If `cache` is specified, entities will be cached according to the cache settings.
	 * Note: cache refers to individual items (such as received from `getItemById` or with an ApiCall), not queries.
	 */
	cache?:boolean | DataCacheSettings<T>,

	/**
	 * The domain to use for all calls for this Entity/ApiCall. Used as a prefix for all HTTP requests.
	 * Set to an empty string to avoid this altogether (in case the data arrives from an external URL, for example).
	 * If not set and not an empty string, Paris will use config.apiRoot instead.
	 */
	baseUrl?:EntityConfigFunctionOrValue,

	/**
	 * Query params to always send when requesting data.
	 */
	fixedData?: { [index:string]:any },

	/**
	 * If `true`, a value that's specified in DataQuery.params and is an array will result in multiple params in the HTTP request
	 * @example <caption>Using separateArrayParams</caption>
	 * ```typescript
	 * @Entity({
	 * 	singularName: 'My entity',
	 * 	pluralName: 'My entities',
	 * 	endpoint: 'myentity',
	 * 	separateArrayParams: true
	 * })
	 * export class MyEntity extends EntityModelBase{}
	 *
	 * paris.query(MyEntity, { where: { foo: ['bar', 'lish'] }})
	 * 	.subscribe((dataSet:DataSet<MyEntity>) => console.log(dataSet));
	 * ```
	 *
	 * In this example, the API call will be to (config.apiRoot)/myentity?foo=bar&foo=lish.
	 * If separateArrayParams wasn't specified as `true`, the api call would have been to:
	 * (config.apiRoot)/myentity?foo=bar,lish
	 */
	separateArrayParams?:boolean,

	/**
	 * A function that if specifies, parses whatever is received from the API call, before Paris starts handling it.
	 * @param {TRawData} data
	 * @param {ParisConfig} config
	 * @param {DataQuery} query
	 */
	parseData?:(data:TRawData, config?:ParisConfig, query?:DataQuery) => T
}
