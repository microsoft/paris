import { DataSet } from "../dataset/dataset";
import { DataQuery } from "../dataset/data-query";
import { DataOptions } from "../dataset/data.options";
import { Observable } from "rxjs/Observable";
import { DataStoreService } from "../services/data-store.service";
import { ParisConfig } from "../config/paris-config";
import { EntityBackendConfig } from "../entity/entity.config";
import { DataEntityConstructor } from "../entity/data-entity.base";
import { Paris } from "../services/paris";
import { DataCache } from "../services/cache";
import { Subject } from "rxjs/Subject";
import { Index } from "../models";
import { IEntityConfigBase } from "../entity/entity-config.base";
import { ModelBase } from "../models/model.base";
export declare class ReadonlyRepository<T extends ModelBase> {
    readonly entity: IEntityConfigBase;
    entityBackendConfig: EntityBackendConfig;
    protected config: ParisConfig;
    entityConstructor: DataEntityConstructor<T>;
    protected dataStore: DataStoreService;
    protected paris: Paris;
    constructor(entity: IEntityConfigBase, entityBackendConfig: EntityBackendConfig, config: ParisConfig, entityConstructor: DataEntityConstructor<T>, dataStore: DataStoreService, paris: Paris);
    protected _allItems$: Observable<Array<T>>;
    protected _allValues: Array<T>;
    protected _allValuesMap: Map<string, T>;
    protected _cache: DataCache<T>;
    protected _allItemsSubject$: Subject<Array<T>>;
    protected readonly baseUrl: string;
    readonly allItems$: Observable<Array<T>>;
    protected readonly cache: DataCache<T>;
    readonly endpointName: string;
    readonly endpointUrl: string;
    protected setAllItems(): Observable<Array<T>>;
    createNewItem(): T;
    createItem(itemData: any, options?: DataOptions, query?: DataQuery): Observable<T>;
    query(query?: DataQuery, dataOptions?: DataOptions): Observable<DataSet<T>>;
    queryItem(query: DataQuery, dataOptions?: DataOptions): Observable<T>;
    getItemById(itemId: string | number, options?: DataOptions, params?: {
        [index: string]: any;
    }): Observable<T>;
    /**
     * Creates a JSON object that can be saved to server, with the reverse logic of getItemModelData
     * @param {T} item
     * @returns {Index}
     */
    serializeItem(item: T): Index;
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
    static getModelData<T extends ModelBase>(rawData: Index, entity: IEntityConfigBase, config: ParisConfig, paris: Paris, options?: DataOptions, query?: DataQuery): Observable<T>;
    private static getSubModel(entityField, value, paris, config, options?);
    private static mapToEntityFieldIndex(entityFieldId, value);
    private static getEntityItem<U>(repository, data, options?);
    private static getValueObjectItem<U>(valueObjectType, data, options, paris, config?);
    /**
     * Validates that the specified item is valid, according to the requirements of the entity (or value object) it belongs to.
     * @param item
     * @param {EntityConfigBase} entity
     * @returns {boolean}
     */
    static validateItem(item: any, entity: IEntityConfigBase): boolean;
    /**
     * Serializes an object value
     * @param item
     * @returns {Index}
     */
    static serializeItem(item: any, entity: IEntityConfigBase, paris: Paris): Index;
}
