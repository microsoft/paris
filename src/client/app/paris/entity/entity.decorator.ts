import {ModelEntity, ModelEntityConfig} from "./entity.config";
import {DataEntityType} from "./data-entity.base";
import {entitiesService} from "../services/entities.service";

export function Entity(config:ModelEntityConfig){
	return (target:DataEntityType) => {
		entitiesService.addEntity(target, new ModelEntity(config));
	}
}
