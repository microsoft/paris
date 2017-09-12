import {DataEntityType} from "../entity/data-entity.base";
import {ModelEntity} from "../entity/entity.config";

class EntitiesService{
	private allEntities:Map<DataEntityType, ModelEntity> = new Map();

	getEntityByType(dataEntityType:DataEntityType):ModelEntity{
		return this.allEntities.get(dataEntityType) || this.allEntities.get(dataEntityType.prototype);
	}

	addEntity(dataEntityType:DataEntityType, entityConfig:ModelEntity):void{
		if (!this.allEntities.has(dataEntityType.prototype))
			this.allEntities.set(dataEntityType.prototype, entityConfig);
	}
}

export let entitiesService = new EntitiesService();
