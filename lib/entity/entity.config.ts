import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";
import {ParisConfig} from "../config/paris-config";
import {DataEntityConstructor} from "./data-entity.base";

export class ModelEntity extends EntityConfigBase{
	endpoint:EntityConfigFunctionOrValue;
	loadAll?:boolean = false;
	cache?:ModelEntityCacheConfig;
	baseUrl?:EntityConfigFunctionOrValue;
	allItemsProperty?:string;
	allItemsEndpoint?:string;

	constructor(config:EntityConfig, entityConstructor:DataEntityConstructor<any>){
		super(config, entityConstructor);

		this.loadAll = config.loadAll === true;
		if (!this.endpoint && !this.values)
			throw new Error(`Can't create entity ${this.entityConstructor.name}, no endpoint or values defined.`);
	}
}

export interface EntityConfig extends IEntityConfigBase{
	endpoint?:EntityConfigFunctionOrValue,
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
