import { DataEntityConstructor, DataEntityType } from "../entity/data-entity.base";
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
import { EntityRelationshipConfig } from "../entity/entity-relationship";
import { RelationshipType } from "../models/relationship-type.enum";
export declare class RelationshipRepository<T extends ModelBase, U extends ModelBase> extends ReadonlyRepository<U> implements IRelationshipRepository {
    sourceEntityType: DataEntityConstructor<T>;
    dataEntityType: DataEntityConstructor<U>;
    private sourceRepository;
    readonly relationshipConfig: EntityRelationshipConfig;
    sourceItem: T;
    readonly allowedTypes: Set<RelationshipType>;
    constructor(sourceEntityType: DataEntityConstructor<T>, dataEntityType: DataEntityConstructor<U>, relationTypes: Array<RelationshipType>, config: ParisConfig, dataStore: DataStoreService, paris: Paris);
    query(query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<U>>;
    queryItem(query?: DataQuery, dataOptions?: DataOptions): Observable<U>;
    queryForItem(item: ModelBase, query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<U>>;
    getRelatedItem(item: ModelBase, query?: DataQuery, dataOptions?: DataOptions): Observable<U>;
    private getRelationQueryWhere(item);
}
export interface IRelationshipRepository extends IReadonlyRepository {
    sourceEntityType: DataEntityType;
    dataEntityType: DataEntityType;
    relationshipConfig: EntityRelationshipConfig;
    queryForItem: (item: EntityModelBase, query?: DataQuery, dataOptions?: DataOptions) => Observable<DataSet<ModelBase>>;
    getRelatedItem: (itemId?: any, query?: DataQuery, dataOptions?: DataOptions) => Observable<ModelBase>;
    allowedTypes: Set<RelationshipType>;
}
