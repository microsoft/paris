import {DataEntityType} from "./data-entity.base";
import {EntityRelationshipConfig} from "./entity-relationship";
import {ModelBase} from "../../config/model.base";
import {RelationshipType} from "../../config/relationship-type.enum";

export interface EntityRelationshipRepositoryType<TSource extends ModelBase, TData extends ModelBase> extends IEntityRelationshipRepositoryType<TSource, TData>{
	sourceEntityType?:DataEntityType<TSource>,
	dataEntityType?:DataEntityType<TData>,
	relationshipConfig?:EntityRelationshipConfig<TSource, TData>
}

export interface IEntityRelationshipRepositoryType<TSource extends ModelBase, TData extends ModelBase>{
	sourceEntityType?:DataEntityType<TSource>,
	dataEntityType?:DataEntityType<TData>,
	relationshipConfig?:EntityRelationshipConfig<TSource, TData>,
	allowedTypes?:Array<RelationshipType>
}
