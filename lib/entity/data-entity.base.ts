import {EntityModelConfigBase} from "../models/entity-config-base.interface";
import {ModelEntity} from "./entity.config";
import {EntityConfigBase} from "./entity-config.base";
import {ModelBase} from "../models/model.base";

export interface DataEntityConstructor<TEntity extends ModelBase<TRawData>, TRawData = any> extends DataEntityType<TEntity, TRawData>{
	new(data?:any, rawData?:TRawData): TEntity
}

export interface DataEntityType<TEntity extends ModelBase<TRawData> = any, TRawData = any>{
	new(data?:EntityModelConfigBase, rawData?:any):TEntity,
	singularName?:string,
	pluralName?:string,
	entityConfig?:ModelEntity<TEntity, TRawData>,
	valueObjectConfig?:EntityConfigBase,
}
