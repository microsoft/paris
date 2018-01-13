import {EntityBackendConfig, ModelEntity} from "./entity.config";
import {IEntityConfigBase} from "./entity-config.base";
import {ModelBase} from "../models/model.base";

export interface IEntityRelationship extends EntityBackendConfig {
	entity:string,
	foreignKey?:string,
	getRelationshipData?: (item?:any) => { [index:string]:any }
}

export interface EntityRelationship extends EntityBackendConfig{
	entity:IEntityConfigBase,
	foreignKey?: string,
	getRelationshipData?: (item?:ModelBase) => { [index:string]:any }
}
