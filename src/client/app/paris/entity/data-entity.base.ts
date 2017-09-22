import {IIdentifiable} from "../models/identifiable.model";
import {ModelEntity} from "./entity.config";

export interface DataEntityConstructor<T> extends DataEntityType{
	new(data:IIdentifiable): T
}

export interface DataEntityType{
	new(data:IIdentifiable):any,
	entityConfig?:ModelEntity
}
