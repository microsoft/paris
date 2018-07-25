import {EntityModelConfigBase} from "../models/entity-config-base.interface";
import {ModelEntity} from "./entity.config";
import {EntityConfigBase} from "./entity-config.base";
import {ModelBase} from "../models/model.base";
import {EntityId} from "../models/entity-id.type";

export interface DataEntityConstructor<TEntity extends ModelBase, TRawData = any, TId extends EntityId = string> extends DataEntityType<TEntity, TRawData, TId>{
	new(data?:any, rawData?:TRawData): TEntity
}

export interface DataEntityType<TEntity extends ModelBase = any, TRawData = any, TId extends EntityId = string>{
	new(data?:EntityModelConfigBase, rawData?:TRawData):TEntity,
	singularName?:string,
	pluralName?:string,
	entityConfig?:ModelEntity<TEntity, TRawData, TId>,
	valueObjectConfig?:EntityConfigBase,
}
