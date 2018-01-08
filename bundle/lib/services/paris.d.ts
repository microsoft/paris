import { ParisConfig } from "../config/paris-config";
import { DataEntityConstructor, DataEntityType } from "../entity/data-entity.base";
import { Repository } from "../repository/repository";
import { DataStoreService } from "./data-store.service";
import { EntityConfigBase } from "../entity/entity-config.base";
import { Observable } from "rxjs/Observable";
import { SaveEntityEvent } from "../events/save-entity.event";
import { RemoveEntitiesEvent } from "../events/remove-entities.event";
import { RelationshipRepository } from "../repository/relationship-repository";
import { ModelBase } from "../models/model.base";
export declare class Paris {
    private repositories;
    private relationshipRepositories;
    readonly dataStore: DataStoreService;
    readonly config: ParisConfig;
    save$: Observable<SaveEntityEvent>;
    private _saveSubject$;
    remove$: Observable<RemoveEntitiesEvent>;
    private _removeSubject$;
    constructor(config?: ParisConfig);
    getRepository<T extends ModelBase>(entityConstructor: DataEntityConstructor<T>): Repository<T> | null;
    getRelationshipRepository<T extends ModelBase, U extends ModelBase>(sourceEntityConstructor: DataEntityConstructor<T>, targetEntityConstructor: DataEntityConstructor<U>): RelationshipRepository<T, U>;
    getModelBaseConfig(entityConstructor: DataEntityType): EntityConfigBase;
}
