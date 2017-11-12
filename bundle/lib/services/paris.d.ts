import { ParisConfig } from "../config/paris-config";
import { EntityModelBase } from "../models/entity-model.base";
import { DataEntityConstructor } from "../entity/data-entity.base";
import { Repository } from "../repository/repository";
export declare class Paris {
    private repositories;
    private dataStore;
    readonly config: ParisConfig;
    constructor(config?: ParisConfig);
    getRepository<T extends EntityModelBase>(entityConstructor: DataEntityConstructor<T>): Repository<T> | null;
}
