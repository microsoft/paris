import { ParisConfig } from "../config/paris-config";
import { DataEntityConstructor, DataEntityType } from "../entity/data-entity.base";
import { Repository } from "../repository/repository";
import { EntityBackendConfig } from "../entity/entity.config";
import { DataStoreService } from "./data-store.service";
import { EntityConfigBase } from "../entity/entity-config.base";
import { Observable } from "rxjs/Observable";
import { SaveEntityEvent } from "../events/save-entity.event";
import { RemoveEntitiesEvent } from "../events/remove-entities.event";
import { RelationshipRepository } from "../repository/relationship-repository";
import { ModelBase } from "../models/model.base";
import { DataSet } from "../dataset/dataset";
import { DataQuery } from "../dataset/data-query";
import { DataOptions } from "../dataset/data.options";
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
    getRelationshipRepository<T extends ModelBase, U extends ModelBase>(relationshipConstructor: Function): RelationshipRepository<T, U>;
    getModelBaseConfig(entityConstructor: DataEntityType): EntityConfigBase;
    query<T extends ModelBase>(entityConstructor: DataEntityConstructor<T>, query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<T>>;
    callQuery<T extends ModelBase>(entityConstructor: DataEntityConstructor<T>, backendConfig: EntityBackendConfig, query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<T>>;
    createItem<T extends ModelBase>(entityConstructor: DataEntityConstructor<T>, data: any, dataOptions?: DataOptions, query?: DataQuery): Observable<T>;
    getItemById<T extends ModelBase>(entityConstructor: DataEntityConstructor<T>, itemId: string | number, options?: DataOptions, params?: {
        [index: string]: any;
    }): Observable<T>;
    queryForItem<T extends ModelBase, U extends ModelBase>(relationshipConstructor: Function, item: ModelBase, query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<U>>;
    getRelatedItem<T extends ModelBase, U extends ModelBase>(relationshipConstructor: Function, item: ModelBase, query?: DataQuery, dataOptions?: DataOptions): Observable<U>;
    getValue<T extends ModelBase>(entityConstructor: DataEntityConstructor<T>, valueId: any): T;
}
