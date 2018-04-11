import {EntityConfigFunctionOrValue, ModelEntityCacheConfig} from "../entity/entity.config";
import {ParisConfig} from "../config/paris-config";
import {DataQuery} from "../dataset/data-query";
import {DataCacheSettings} from "../services/cache";

export interface ApiCallBackendConfigInterface<T = any>{
	endpoint?:((config?:ParisConfig, query?:DataQuery) => string) | string,
	cache?:boolean | DataCacheSettings<T>,
	baseUrl?:EntityConfigFunctionOrValue,
	fixedData?: { [index:string]:any },
	separateArrayParams?:boolean
}
