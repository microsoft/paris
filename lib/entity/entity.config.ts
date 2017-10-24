import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";
import {ParisConfig} from "../config/paris-config";

export class ModelEntity extends EntityConfigBase{
	endpoint:EntityConfigFunctionOrValue;
	loadAll?:boolean = false;
	cache?:ModelEntityCacheConfig;
	baseUrl?:EntityConfigFunctionOrValue;
	allItemsProperty?:string;
	allItemsEndpoint?:string;

	constructor(config:EntityConfig){
		super(config);

		this.loadAll = config.loadAll === true;
	}
}

export interface EntityConfig extends IEntityConfigBase{
	endpoint:EntityConfigFunctionOrValue,
	loadAll?:boolean,
	cache?:ModelEntityCacheConfig,
	baseUrl?:EntityConfigFunctionOrValue,
	allItemsProperty?:string,
	allItemsEndpoint?:string
}

export interface ModelEntityCacheConfig{
	time?: number,
	max?: number
}

export type EntityConfigFunctionOrValue = ((config?:ParisConfig) => string) | string;
