import { Observable } from "rxjs/Observable";
export declare class DataCache<T> {
    time: number;
    obj: number;
    getter: (_: any) => Promise<T> | Observable<T>;
    private _keys;
    private _values;
    private _timeouts;
    private _getObservable;
    constructor(settings?: DataCacheSettings<T>);
    /**
     * Gets a value from the cache collection.
     * If getter is specified, uses it to get the data.
     * @param key
     * @returns {Observable<T>}
     */
    get(key: any): Observable<T>;
    /**
     * Adds an item to the Cached collection. If DataCache.time was specified, the item will expire after this time (in milliseconds), and will be deleted.
     * @param key {String}
     * @param value
     * @returns {Cache}
     */
    add(key: any, value: T): DataCache<T>;
    /**
     * Removes an item from the cache collection.
     * @param key
     * @returns {*}
     */
    remove(key: any): T;
    clearGetters(): void;
    private static validateSettings<T>(config?);
}
export interface DataCacheSettings<T> {
    max?: number;
    time?: number;
    getter?: (_: any) => Observable<T>;
}
