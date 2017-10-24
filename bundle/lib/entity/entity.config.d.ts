import { EntityConfigBase, IEntityConfigBase } from "./entity-config.base";
import { ParisConfig } from "../config/paris-config";
export declare class ModelEntity extends EntityConfigBase {
    endpoint: EntityConfigFunctionOrValue;
    loadAll?: boolean;
    cache?: ModelEntityCacheConfig;
    baseUrl?: EntityConfigFunctionOrValue;
    allItemsProperty?: string;
    allItemsEndpoint?: string;
    constructor(config: EntityConfig);
}
export interface EntityConfig extends IEntityConfigBase {
    endpoint: EntityConfigFunctionOrValue;
    loadAll?: boolean;
    cache?: ModelEntityCacheConfig;
    baseUrl?: EntityConfigFunctionOrValue;
    allItemsProperty?: string;
    allItemsEndpoint?: string;
}
export interface ModelEntityCacheConfig {
    time?: number;
    max?: number;
}
export declare type EntityConfigFunctionOrValue = ((config?: ParisConfig) => string) | string;
