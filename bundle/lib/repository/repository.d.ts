import { ModelEntity } from "../entity/entity.config";
import { DataEntityConstructor } from "../entity/data-entity.base";
import { Observable } from "rxjs/Observable";
import { RepositoryManagerService } from "./repository-manager.service";
import { IRepository } from "./repository.interface";
import { DataStoreService } from "../services/data-store/data-store.service";
import { ParisConfig } from "../config/paris-config";
import { DataSetOptions } from "../dataset/dataset-options";
import { DataSet } from "../dataset/dataset";
import { Index } from "../models/index";
import { EntityModelBase } from "../models/entity-model.base";
export declare class Repository<T extends EntityModelBase> implements IRepository {
    readonly entity: ModelEntity;
    private config;
    private entityConstructor;
    private dataStore;
    private repositoryManagerService;
    save$: Observable<T>;
    private _allItems$;
    private _allValues;
    private _allValuesMap;
    private _cache;
    private _allItemsSubject$;
    private _saveSubject$;
    readonly allItems$: Observable<Array<T>>;
    private readonly cache;
    private readonly baseUrl;
    constructor(entity: ModelEntity, config: ParisConfig, entityConstructor: DataEntityConstructor<T>, dataStore: DataStoreService, repositoryManagerService: RepositoryManagerService);
    createItem(itemData: any): Observable<T>;
    createNewItem(): T;
    /**
     * Populates the item dataset with any sub @model. For example, if an ID is found for a property whose type is an entity,
     * the property's value will be an instance of that entity, for the ID, not the ID.
     * @param {Index} itemData
     * @param {EntityConfigBase} entity
     * @param {ParisConfig} config
     * @param {RepositoryManagerService} repositoryManagerService
     * @param {DataEntityConstructor<T extends EntityModelBase>} entityConstructor
     * @returns {Observable<T extends EntityModelBase>}
     */
    private static getModelData<T>(itemData, entity, config, repositoryManagerService, entityConstructor);
    private static mapToEntityFieldIndex(entityFieldId, value);
    private static getEntityItem<U>(repository, itemData);
    private static getValueObjectItem<U>(valueObjectType, data, repositoryManagerService, config?);
    getItemsDataSet(options?: DataSetOptions): Observable<DataSet<T>>;
    getItemById(itemId: string | number, allowCache?: boolean): Observable<T>;
    private setAllItems();
    save(item: T): Observable<T>;
    getItemSaveData(item: T): Index;
}
