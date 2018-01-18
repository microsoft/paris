import { EntityBackendConfig } from "./entity.config";
import { ModelBase } from "../models/model.base";
import { DataEntityType } from "./data-entity.base";
export interface EntityRelationshipConfig extends EntityBackendConfig {
    sourceEntity: DataEntityType;
    dataEntity: DataEntityType;
    foreignKey?: string;
    getRelationshipData?: (item?: ModelBase) => {
        [index: string]: any;
    };
}
