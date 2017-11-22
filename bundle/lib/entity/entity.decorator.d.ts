import { EntityConfig } from "./entity.config";
import { DataEntityType } from "./data-entity.base";
export declare function Entity(config: EntityConfig): (target: DataEntityType) => void;
