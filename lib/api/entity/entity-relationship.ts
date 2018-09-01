import {EntityBackendConfig} from "../../config/entity.config";
import {ModelBase} from "../../config/model.base";
import {DataEntityType} from "./data-entity.base";
import {RelationshipType} from "../../config/relationship-type.enum";

export interface EntityRelationshipConfig<TSource extends ModelBase, TData extends ModelBase> extends EntityBackendConfig<TData>{
	sourceEntity:DataEntityType<TSource>,
	dataEntity:DataEntityType<TData>,
	foreignKey?: string,
	getRelationshipData?: (item?:TSource) => { [index:string]:any },
	allowedTypes?: Array<RelationshipType>
}
