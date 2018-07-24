import {EntityConfig, ModelEntity} from "./entity.config";
import {DataEntityType} from "./data-entity.base";
import {entitiesService} from "../services/entities.service";
import {ModelBase} from "../models/model.base";
import {EntityId} from "../models/entity-id.type";
import {EntityModelBase} from "../models/entity-model.base";

export function Entity<TEntity extends EntityModelBase<TId, TRawData> = EntityModelBase<TId, TRawData>, TRawData = any, TId extends EntityId = string>
	(config:EntityConfig<TEntity, TRawData>){
	return (target:DataEntityType<TEntity, TRawData>) => {
		let entity:ModelEntity<TEntity, TRawData> = new ModelEntity(config, target.prototype.constructor);
		target.entityConfig = entity;
		target.singularName = config.singularName;
		target.pluralName = config.pluralName;
		entitiesService.addEntity(target, entity);
	}
}
