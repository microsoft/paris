import {DataEntityType} from "../../api/entity/data-entity.base";
import {EntityRelationshipConfig} from "../../api/entity/entity-relationship";
import {ModelBase} from "../model.base";

export class EntityRelationshipsService{
	protected relationships:Map<DataEntityType, Map<DataEntityType, EntityRelationshipConfig<ModelBase, ModelBase>>> = new Map;

	addRelationship<TSource extends ModelBase, TData extends ModelBase>(relationship:EntityRelationshipConfig<TSource, TData>):void{
		let sourceDataEntityType:DataEntityType = relationship.sourceEntity,
			sourceRelationships:Map<DataEntityType<TData>, EntityRelationshipConfig<TSource, TData>> =  <Map<DataEntityType<TData>, EntityRelationshipConfig<TSource, TData>>>this.relationships.get(sourceDataEntityType);

		if (!sourceRelationships){
			sourceRelationships = new Map;
			this.relationships.set(sourceDataEntityType, sourceRelationships);
		}

		let mappedRelationship:EntityRelationshipConfig<TSource, TData> = sourceRelationships.get(relationship.dataEntity);
		if (mappedRelationship)
			throw new Error(`Duplicate relationship: ${sourceDataEntityType.singularName} -> ${relationship.dataEntity.singularName}`);

		sourceRelationships.set(relationship.dataEntity, relationship);
	}

	getRelationship<TSource extends ModelBase, TData extends ModelBase>(sourceDataType:DataEntityType<TSource>, dataType:DataEntityType<TData>):EntityRelationshipConfig<TSource, TData> {
		let sourceRelationships:Map<DataEntityType, EntityRelationshipConfig<TSource, TData>> = <Map<DataEntityType<TData>, EntityRelationshipConfig<TSource, TData>>>this.relationships.get(sourceDataType);
		if (!sourceRelationships)
			return null;

		return sourceRelationships.get(dataType);
	}
}

export const entityRelationshipsService = new EntityRelationshipsService;
