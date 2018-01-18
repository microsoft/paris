import {DataEntityType} from "../entity/data-entity.base";
import {EntityRelationshipConfig} from "../entity/entity-relationship";

export class EntityRelationshipsService{
	protected relationships:Map<DataEntityType, Map<DataEntityType, EntityRelationshipConfig>> = new Map;

	addRelationship(relationship:EntityRelationshipConfig):void{
		let sourceDataEntityType:DataEntityType = relationship.sourceEntity,
			sourceRelationships:Map<DataEntityType, EntityRelationshipConfig> = this.relationships.get(sourceDataEntityType);

		if (!sourceRelationships){
			sourceRelationships = new Map;
			this.relationships.set(sourceDataEntityType, sourceRelationships);
		}

		let mappedRelationship:EntityRelationshipConfig = sourceRelationships.get(relationship.dataEntity);
		if (mappedRelationship)
			throw new Error(`Duplicate relationship: ${sourceDataEntityType.singularName} -> ${relationship.dataEntity.singularName}`);

		sourceRelationships.set(relationship.dataEntity, relationship);
	}

	getRelationship(sourceDataType:DataEntityType, dataType:DataEntityType):EntityRelationshipConfig{
		let sourceRelationships:Map<DataEntityType, EntityRelationshipConfig> = this.relationships.get(sourceDataType);
		if (!sourceRelationships)
			return null;

		return sourceRelationships.get(dataType);
	}
}

export const entityRelationshipsService = new EntityRelationshipsService;
