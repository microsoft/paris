import {IIdentifiable} from "../models/identifiable.model";
import {ModelEntity} from "./entity.config";
import {EntityConfigBase} from "./entity-config.base";

export interface DataEntityConstructor<T> extends DataEntityType{
	new(data?:any): T
}

export interface DataEntityType{
	new(data:IIdentifiable):any,
	entityConfig?:ModelEntity,
	valueObjectConfig?:EntityConfigBase
}
