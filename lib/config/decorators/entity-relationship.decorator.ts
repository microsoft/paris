import {EntityRelationshipConfig} from "../../api/entity/entity-relationship";
import {entityRelationshipsService} from "../services/entity-relationships.service";

export function EntityRelationship(entityRelationshipConfig:EntityRelationshipConfig<any, any>){
	return (target:any) => {
		target.sourceEntityType = entityRelationshipConfig.sourceEntity;
		target.dataEntityType = entityRelationshipConfig.dataEntity;
		target.relationshipConfig = entityRelationshipConfig;
		target.allowedTypes = entityRelationshipConfig.allowedTypes;

		entityRelationshipsService.addRelationship(entityRelationshipConfig);
	}
}
