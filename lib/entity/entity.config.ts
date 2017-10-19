import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";

export class ModelEntity extends EntityConfigBase{
	endpoint:string;
	loadAll?:boolean = false;
	cache?:ModelEntityCacheConfig;

	constructor(config:EntityConfig){
		super(config);

		this.endpoint = config.endpoint;
		this.loadAll = config.loadAll === true;
		this.cache = config.cache;
	}
}

export interface EntityConfig extends IEntityConfigBase{
	endpoint:string,
	loadAll?:boolean,
	cache?:ModelEntityCacheConfig
}

export interface ModelEntityCacheConfig{
	time?: number,
	max?: number
}
