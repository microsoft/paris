import {ModelEntity, ModelEntityConfig} from "./entity.config";
import {DataEntityType} from "./data-entity.base";
import {entitiesService} from "../services/entities.service";

export function Entity(config:ModelEntityConfig){
	return (target:DataEntityType) => {
		let entity:ModelEntity = new ModelEntity(config);
		target.entityConfig = entity;
		entitiesService.addEntity(target, entity);
	}
}
