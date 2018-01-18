import {DataEntityConstructor, DataEntityType} from "./data-entity.base";
import {EntityRelationshipConfig} from "./entity-relationship";
import {ModelBase} from "../models/model.base";

export interface EntityRelationshipRepositoryType<T extends ModelBase, U extends ModelBase> extends IEntityRelationshipRepositoryType{
	sourceEntityType?:DataEntityConstructor<T>,
	dataEntityType?:DataEntityConstructor<U>,
	relationshipConfig?:EntityRelationshipConfig
}

export interface IEntityRelationshipRepositoryType{
	sourceEntityType?:DataEntityType,
	dataEntityType?:DataEntityType,
	relationshipConfig?:EntityRelationshipConfig
}
