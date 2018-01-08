import {EntityBackendConfig, ModelEntity} from "./entity.config";
import {IEntityConfigBase} from "./entity-config.base";

export interface IEntityRelationship extends EntityBackendConfig {
	entity:string,
	foreignKey?:string
}

export interface EntityRelationship extends EntityBackendConfig{
	entity:IEntityConfigBase,
	foreignKey?: string
}
