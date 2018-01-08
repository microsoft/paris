import { EntityConfigBase, IEntityConfigBase } from "./entity-config.base";
import { ParisConfig } from "../config/paris-config";
import { DataEntityConstructor } from "./data-entity.base";
import { DataQuery } from "../dataset/data-query";
export declare class ModelEntity extends EntityConfigBase implements EntityConfig {
    endpoint: EntityConfigFunctionOrValue;
    loadAll?: boolean;
    cache?: ModelEntityCacheConfig;
    baseUrl?: EntityConfigFunctionOrValue;
    allItemsProperty?: string;
    allItemsEndpoint?: string;
    allItemsEndpointTrailingSlash?: boolean;
    parseDataQuery?: (dataQuery: DataQuery) => {
        [index: string]: any;
    };
    parseItemQuery?: (itemId: string | number, entity?: IEntityConfigBase, config?: ParisConfig) => string;
    constructor(config: EntityConfig, entityConstructor: DataEntityConstructor<any>);
}
export interface EntityConfig extends IEntityConfigBase, EntityBackendConfig {
}
export interface EntityBackendConfig {
    loadAll?: boolean;
    endpoint?: EntityConfigFunctionOrValue;
    cache?: ModelEntityCacheConfig;
    baseUrl?: EntityConfigFunctionOrValue;
    allItemsProperty?: string;
    allItemsEndpoint?: string;
    allItemsEndpointTrailingSlash?: boolean;
    parseDataQuery?: (dataQuery: DataQuery) => {
        [index: string]: any;
    };
    parseItemQuery?: (itemId: string | number, entity?: IEntityConfigBase, config?: ParisConfig) => string;
}
export interface ModelEntityCacheConfig {
    time?: number;
    max?: number;
}
export declare type EntityConfigFunctionOrValue = ((config?: ParisConfig) => string) | string;
