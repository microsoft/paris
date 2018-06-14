import {EntityConfigFunctionOrValue} from "../entity/entity.config";
import {ParisConfig} from "../config/paris-config";
import {DataQuery} from "../dataset/data-query";
import {DataCacheSettings} from "../services/cache";

export interface ApiCallBackendConfigInterface<T = any, TRawData = any>{
	endpoint?:EntityConfigFunctionOrValue,
	cache?:boolean | DataCacheSettings<T>,
	baseUrl?:EntityConfigFunctionOrValue,
	fixedData?: { [index:string]:any },
	separateArrayParams?:boolean,
	parseData?:(data:TRawData, config?:ParisConfig, query?:DataQuery) => T
}
