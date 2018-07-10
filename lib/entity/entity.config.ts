import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";
import {ParisConfig} from "../config/paris-config";
import {DataEntityConstructor} from "./data-entity.base";
import {DataQuery} from "../dataset/data-query";
import {HttpOptions, RequestMethod} from "../services/http.service";
import {ModelBase} from "../models/model.base";
import {ApiCallBackendConfigInterface} from "../models/api-call-backend-config.interface";

export class ModelEntity<T extends ModelBase = any> extends EntityConfigBase<T> implements EntityConfig{
	endpoint:EntityConfigFunctionOrValue;
	loadAll?:boolean = false;
	cache?:boolean | ModelEntityCacheConfig<T>;
	baseUrl?:EntityConfigFunctionOrValue;
	allItemsProperty?:string;
	allItemsEndpoint?:string;
	allItemsEndpointTrailingSlash?:boolean;
	parseDataQuery?:(dataQuery:DataQuery) => { [index:string]:any };
	parseItemQuery?:(itemId:string|number, entity?:IEntityConfigBase<T>, config?:ParisConfig, params?:{ [index:string]:any }) => string;
	parseSaveQuery?:(item:T, entity?:IEntityConfigBase, config?:ParisConfig) => string;
	parseRemoveQuery?:(items:Array<T>, entity?:IEntityConfigBase, config?:ParisConfig) => string;
	serializeItem?:(item:T, serializedItem?:any, entity?:IEntityConfigBase, config?:ParisConfig, serializationData?:any) => any;
	getRemoveData?:(items:Array<T>) => any;

	constructor(config:EntityConfig, entityConstructor:DataEntityConstructor<T>){
		super(config, entityConstructor);

		this.loadAll = config.loadAll === true;
		if (!this.endpoint && !this.values)
			throw new Error(`Can't create entity ${config.singularName || this.entityConstructor.name}, no endpoint or values defined.`);
	}
}

export interface EntityConfig extends IEntityConfigBase, EntityBackendConfig{
}

export interface EntityBackendConfig extends ApiCallBackendConfigInterface{
	loadAll?:boolean,
	allItemsProperty?:string,
	allItemsEndpoint?:string,
	allItemsEndpointTrailingSlash?:boolean,
	getRemoveData?:(items:Array<ModelBase>) => any,
	parseDataQuery?:(dataQuery:DataQuery) => { [index:string]:any },
	parseItemQuery?:(itemId:string|number, entity?:IEntityConfigBase, config?:ParisConfig, params?:{ [index:string]:any }) => string,
	parseSaveQuery?:(item:any, entity?:IEntityConfigBase, config?:ParisConfig, options?: HttpOptions) => string,
	parseRemoveQuery?:(items:Array<ModelBase>, entity?:IEntityConfigBase, config?:ParisConfig) => string,
	serializeItem?:(item:any, serializedItem?:any, entity?:IEntityConfigBase, config?:ParisConfig, serializationData?:any) => any,
	saveMethod?:((item:any, config?:ParisConfig) => RequestMethod) | RequestMethod,

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
