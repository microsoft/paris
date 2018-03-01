import { EntityConfig } from "../entity/entity.config";
import { DataEntityConstructor } from "../entity/data-entity.base";
import { Observable } from "rxjs/Observable";
import { IRepository } from "./repository.interface";
import { DataStoreService } from "../services/data-store.service";
import { ParisConfig } from "../config/paris-config";
import { ModelBase } from "../models/model.base";
import { Paris } from "../services/paris";
import { HttpOptions } from "../services/http.service";
import { SaveEntityEvent } from "../events/save-entity.event";
import { RemoveEntitiesEvent } from "../events/remove-entities.event";
import { ReadonlyRepository } from "./readonly-repository";
export declare class Repository<T extends ModelBase> extends ReadonlyRepository<T> implements IRepository {
    save$: Observable<SaveEntityEvent>;
    remove$: Observable<RemoveEntitiesEvent>;
    private _saveSubject$;
    private _removeSubject$;
    constructor(entity: EntityConfig, config: ParisConfig, entityConstructor: DataEntityConstructor<T>, dataStore: DataStoreService, paris: Paris);
    /**
     * Saves an entity to the server
     * @param {T} item
     * @returns {Observable<T extends EntityModelBase>}
     */
    save(item: T, options?: HttpOptions): Observable<T>;
    private getSaveMethod(item);
    /**
     * Saves multiple items to the server, all at once
     * @param {Array<T extends EntityModelBase>} items
     * @returns {Observable<Array<T extends EntityModelBase>>}
     */
    saveItems(items: Array<T>, options?: HttpOptions): Observable<Array<T>>;
    /**
     * Does the actual saving to server for a list of items.
     * @param {Array<any>} itemsData
     * @param {"PUT" | "POST"} method
     * @returns {Observable<Array<T extends EntityModelBase>>}
     */
    private doSaveItems(itemsData, method, options?);
    remove(items: Array<T>, options?: HttpOptions): Observable<Array<T>>;
}
