import {EntityBackendConfig} from "./entity.config";
import {ModelBase} from "../models/model.base";
import {DataEntityType} from "./data-entity.base";
import {RelationshipType} from "../models/relationship-type.enum";

export interface EntityRelationshipConfig<TSource extends ModelBase, TData extends ModelBase> extends EntityBackendConfig<TData>{
	sourceEntity:DataEntityType<TSource>,
	dataEntity:DataEntityType<TData>,
	foreignKey?: string,
	getRelationshipData?: (item?:TSource) => { [index:string]:any },
	allowedTypes?: Array<RelationshipType>
}
