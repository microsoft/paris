import {EntityModelConfigBase} from "../models/entity-config-base.interface";
import {ModelEntity} from "./entity.config";
import {EntityConfigBase} from "./entity-config.base";
import {ModelBase} from "../models/model.base";

export interface DataEntityConstructor<T extends ModelBase> extends DataEntityType{
	new(data?:any): T
}

export interface DataEntityType{
	new(data?:EntityModelConfigBase):any,
	entityConfig?:ModelEntity,
	valueObjectConfig?:EntityConfigBase
}
