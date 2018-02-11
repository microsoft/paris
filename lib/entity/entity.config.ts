import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";
import {ParisConfig} from "../config/paris-config";
import {DataEntityConstructor} from "./data-entity.base";
import {DataQuery} from "../dataset/data-query";

export class ModelEntity extends EntityConfigBase implements EntityConfig{
	endpoint:EntityConfigFunctionOrValue;
	loadAll?:boolean = false;
	cache?:ModelEntityCacheConfig;
	baseUrl?:EntityConfigFunctionOrValue;
	allItemsProperty?:string;
	allItemsEndpoint?:string;
	allItemsEndpointTrailingSlash?:boolean;
	parseDataQuery?:(dataQuery:DataQuery) => { [index:string]:any };
	parseItemQuery?:(itemId:string|number, entity?:IEntityConfigBase, config?:ParisConfig, params?:{ [index:string]:any }) => string;
	parseSaveQuery?:(item:any, entity?:IEntityConfigBase, config?:ParisConfig) => string;
	serializeItem?:(item:any, serializedItem?:any, entity?:IEntityConfigBase, config?:ParisConfig) => any;

	constructor(config:EntityConfig, entityConstructor:DataEntityConstructor<any>){
		super(config, entityConstructor);

		this.loadAll = config.loadAll === true;
		if (!this.endpoint && !this.values)
			throw new Error(`Can't create entity ${config.singularName || this.entityConstructor.name}, no endpoint or values defined.`);
	}
}

export interface EntityConfig extends IEntityConfigBase, EntityBackendConfig{
}

export interface EntityBackendConfig{
	loadAll?:boolean,
	endpoint?:((config?:ParisConfig, query?:DataQuery) => string) | string,
	cache?:ModelEntityCacheConfig,
	baseUrl?:EntityConfigFunctionOrValue,
	allItemsProperty?:string,
	allItemsEndpoint?:string,
	allItemsEndpointTrailingSlash?:boolean,
	fixedData?: { [index:string]:any },
	parseDataQuery?:(dataQuery:DataQuery) => { [index:string]:any },
	parseItemQuery?:(itemId:string|number, entity?:IEntityConfigBase, config?:ParisConfig, params?:{ [index:string]:any }) => string,
	parseSaveQuery?:(item:any, entity?:IEntityConfigBase, config?:ParisConfig) => string,
	serializeItem?:(item:any, serializedItem?:any, entity?:IEntityConfigBase, config?:ParisConfig) => any
}

export interface ModelEntityCacheConfig{
	time?: number,
	max?: number
}

export type EntityConfigFunctionOrValue = ((config?:ParisConfig) => string) | string;
