import { EntityConfigBase, IEntityConfigBase } from "./entity-config.base";
export declare class ModelEntity extends EntityConfigBase {
    endpoint: string;
    loadAll?: boolean;
    cache?: ModelEntityCacheConfig;
    constructor(config: EntityConfig);
}
export interface EntityConfig extends IEntityConfigBase {
    endpoint: string;
    loadAll?: boolean;
    cache?: ModelEntityCacheConfig;
}
export interface ModelEntityCacheConfig {
    time?: number;
    max?: number;
}
