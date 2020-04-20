import {ModelEntity} from "../../config/entity.config";
import {EntityConfigBase} from "../../config/model-config";
import {ModelBase} from "../../config/model.base";
import {EntityId} from "../../modeling/entity-id.type";

/**
 * This is the interface for the *constructor* of any models - Entity or ValueObject.
 */
export interface DataEntityType<TEntity extends ModelBase = any, TRawData = any, TId extends EntityId = string, TDataSet = any> {
	/**
	 * @param entityData an object containing the same properties as TEntity.
	 * TODO: make entityData something like Partial<TEntity>. This is a problem at the moment, since it doesn't work well with ModelBase.
	 * @param {TRawData} rawData The raw data used to create the model
	 */
	new(entityData?:any, rawData?:TRawData):TEntity,
	singularName?:string,
	pluralName?:string,
	forwardRefName?:string,
	entityConfig?:ModelEntity<TEntity, TRawData, TId>,
	valueObjectConfig?:EntityConfigBase,
}
