import {EntityRelationshipConfig} from "./entity-relationship";
import {entityRelationshipsService} from "../services/entity-relationships.service";

export function EntityRelationship(entityRelationshipConfig:EntityRelationshipConfig){
	return (target:any) => {
		target.sourceEntityType = entityRelationshipConfig.sourceEntity;
		target.dataEntityType = entityRelationshipConfig.dataEntity;
		target.relationshipConfig = entityRelationshipConfig;
		target.allowedTypes = entityRelationshipConfig.allowedTypes;

		entityRelationshipsService.addRelationship(entityRelationshipConfig);
	}
}
