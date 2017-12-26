import { ModelEntity } from "../entity/entity.config";
import { DataEntityConstructor } from "../entity/data-entity.base";
import { Observable } from "rxjs/Observable";
import { IRepository } from "./repository.interface";
import { DataStoreService } from "../services/data-store.service";
import { ParisConfig } from "../config/paris-config";
import { DataQuery } from "../dataset/data-query";
import { DataSet } from "../dataset/dataset";
import { Index } from "../models/index";
import { EntityConfigBase } from "../entity/entity-config.base";
import { ModelBase } from "../models/model.base";
import { EntityModelBase } from "../models/entity-model.base";
import { DataOptions } from "../dataset/data.options";
import { Paris } from "../services/paris";
import { SaveEntityEvent } from "../events/save-entity.event";
import { RemoveEntitiesEvent } from "../events/remove-entities.event";
export declare class Repository<T extends EntityModelBase> implements IRepository {
    readonly entity: ModelEntity;
    private config;
    private entityConstructor;
    private dataStore;
    private paris;
    save$: Observable<SaveEntityEvent>;
    remove$: Observable<RemoveEntitiesEvent>;
    private _allItems$;
    private _allValues;
    private _allValuesMap;
    private _cache;
    private _allItemsSubject$;
    private _saveSubject$;
    private _removeSubject$;
    readonly allItems$: Observable<Array<T>>;
    private readonly cache;
    private readonly baseUrl;
    readonly endpointName: string;
    readonly endpointUrl: string;
    constructor(entity: ModelEntity, config: ParisConfig, entityConstructor: DataEntityConstructor<T>, dataStore: DataStoreService, paris: Paris);
    createItem(itemData: any, options?: DataOptions): Observable<T>;
    createNewItem(): T;
    /**
     * Populates the item dataset with any sub @model. For example, if an ID is found for a property whose type is an entity,
     * the property's value will be an instance of that entity, for the ID, not the ID.
     * @param {Index} rawData
     * @param {EntityConfigBase} entity
     * @param {ParisConfig} config
     * @param {Paris} paris
     * @param {DataOptions} options
     * @returns {Observable<T extends EntityModelBase>}
     */
    static getModelData<T extends ModelBase>(rawData: Index, entity: EntityConfigBase, config: ParisConfig, paris: Paris, options?: DataOptions): Observable<T>;
    private static getSubModel(entityField, value, paris, config, options?);
    private static mapToEntityFieldIndex(entityFieldId, value);
    private static getEntityItem<U>(repository, data, options?);
    private static getValueObjectItem<U>(valueObjectType, data, options, paris, config?);
    query(query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<T>>;
    getItemById(itemId: string | number, options?: DataOptions, params?: {
        [index: string]: any;
    }): Observable<T>;
    private setAllItems();
    /**
     * Saves an entity to the server
     * @param {T} item
     * @returns {Observable<T extends EntityModelBase>}
     */
    save(item: T): Observable<T>;
    remove(items: Array<T>): Observable<Array<T>>;
    /**
     * Validates that the specified item is valid, according to the requirements of the entity (or value object) it belongs to.
     * @param item
     * @param {EntityConfigBase} entity
     * @returns {boolean}
     */
    static validateItem(item: any, entity: EntityConfigBase): boolean;
    /**
     * Creates a JSON object that can be saved to server, with the reverse logic of getItemModelData
     * @param {T} item
     * @returns {Index}
     */
    serializeItem(item: T): Index;
    /**
     * Serializes an object value
     * @param item
     * @returns {Index}
     */
    static serializeItem(item: any, entity: EntityConfigBase, paris: Paris): Index;
}
