import {EntityConfig, ModelEntity} from "../entity.config";
import {DataEntityType} from "../../api/entity/data-entity.base";
import {entitiesService} from "../services/entities.service";

export function Entity(config:EntityConfig<any, any, any, any>){
	return (target:DataEntityType<any, any, any, any>) => {
		let entity:ModelEntity = new ModelEntity(config, target.prototype.constructor);
		target.entityConfig = entity;
		target.singularName = config.singularName;
		target.pluralName = config.pluralName;
		entitiesService.addEntity(target, entity);
	}
}
