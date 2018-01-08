import { DataEntityConstructor } from "../entity/data-entity.base";
import { EntityModelBase } from "../models/entity-model.base";
import { DataSet } from "../dataset/dataset";
import { DataQuery } from "../dataset/data-query";
import { DataOptions } from "../dataset/data.options";
import { Observable } from "rxjs/Observable";
import { DataStoreService } from "../services/data-store.service";
import { ParisConfig } from "../config/paris-config";
import { Paris } from "../services/paris";
import { ReadonlyRepository } from "./readonly-repository";
import { IReadonlyRepository } from "./repository.interface";
import { ModelBase } from "../models/model.base";
export declare class RelationshipRepository<T extends ModelBase, U extends ModelBase> extends ReadonlyRepository<U> implements IRelationshipRepository {
    sourceEntityType: DataEntityConstructor<T>;
    dataEntityType: DataEntityConstructor<U>;
    private sourceRepository;
    private relationship;
    constructor(sourceEntityType: DataEntityConstructor<T>, dataEntityType: DataEntityConstructor<U>, config: ParisConfig, dataStore: DataStoreService, paris: Paris);
    queryForItem(itemId: any, query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<U>>;
    getRelatedItem(itemId?: any, query?: DataQuery, dataOptions?: DataOptions): Observable<U>;
}
export interface IRelationshipRepository extends IReadonlyRepository {
    queryForItem: (item: EntityModelBase, query?: DataQuery, dataOptions?: DataOptions) => Observable<DataSet<ModelBase>>;
    getRelatedItem: (itemId?: any, query?: DataQuery, dataOptions?: DataOptions) => Observable<ModelBase>;
}
