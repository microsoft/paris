import { EntityBackendConfig } from "./entity.config";
import { ModelBase } from "../models/model.base";
import { DataEntityType } from "./data-entity.base";
import { RelationshipType } from "../models/relationship-type.enum";
export interface EntityRelationshipConfig extends EntityBackendConfig {
    sourceEntity: DataEntityType;
    dataEntity: DataEntityType;
    foreignKey?: string;
    getRelationshipData?: (item?: ModelBase) => {
        [index: string]: any;
    };
    allowedTypes?: Array<RelationshipType>;
}
