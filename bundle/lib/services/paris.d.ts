import { ParisConfig } from "../config/paris-config";
import { EntityModelBase } from "../models/entity-model.base";
import { DataEntityConstructor, DataEntityType } from "../entity/data-entity.base";
import { Repository } from "../repository/repository";
import { DataStoreService } from "./data-store.service";
import { EntityConfigBase } from "../entity/entity-config.base";
import { Observable } from "rxjs/Observable";
import { SaveEntityEvent } from "../events/save-entity.event";
import { RemoveEntitiesEvent } from "../events/remove-entities.event";
export declare class Paris {
    private repositories;
    readonly dataStore: DataStoreService;
    readonly config: ParisConfig;
    save$: Observable<SaveEntityEvent>;
    private _saveSubject$;
    remove$: Observable<RemoveEntitiesEvent>;
    private _removeSubject$;
    constructor(config?: ParisConfig);
    getRepository<T extends EntityModelBase>(entityConstructor: DataEntityConstructor<T>): Repository<T> | null;
    getModelBaseConfig(entityConstructor: DataEntityType): EntityConfigBase;
}
