import {Observable} from "rxjs/Observable";
import {from} from "rxjs/observable/from";
import {tap} from "rxjs/operators/tap";
import {of} from "rxjs/observable/of";
import {finalize, map, share} from "rxjs/operators";

export class DataCache<T = any>{
	time:((item:T) => number) | number;
	obj:number;
	getter:(_:any, params?:{ [index:string]: any }) => Promise<T> | Observable<T>;

	private _keys:Array<string>;
	private _values:Map<string, T>;
	private _timeouts:{ [index:string]:any };
	private _getObservable:{ [index:string]:Observable<T> };

	constructor(settings?:DataCacheSettings<T>){
		if (settings) {
			DataCache.validateSettings<T>(settings);

			this.time = settings.time || null; // milliseconds
			this.obj = settings.max;
			this.getter = settings.getter;
		}

		this._keys = [];
		this._values = new Map<string, T>();
		this._timeouts = {};
		this._getObservable = {};

		Object.seal(this);
	}

	/**
	 * Gets a value from the cache collection.
	 * If getter is specified, uses it to get the data.
	 * @param key
	 * @returns {Observable<T>}
	 */
	get(key:any, params?:{ [index:string]: any }):Observable<T>{
		if (!key && key !== 0)
			throw new Error("Can't get DataCache item, key not specified.");

		key = key.toString();

		const cacheKey:string = key + (params !== undefined && params !== null ? "_" + JSON.stringify(params) : "");

		if (this.getter){
			let getObservable = this._getObservable[cacheKey];
			if (getObservable)
				return getObservable;

			let cachedItem:T = this._values.get(cacheKey);
			if (cachedItem !== undefined)
				return of(cachedItem);

			return this._getObservable[cacheKey] = from(this.getter(key, params))
				.pipe(
					tap((value:T) => {
						this.add(cacheKey, value);
					}),
					finalize(() => {
						delete this._getObservable[cacheKey];
					}),
					share()
				);
		}
		else
			return of(this._values.get(key));
	}

	/**
	 * Adds an item to the Cached collection. If DataCache.time was specified, the item will expire after this time (in milliseconds), and will be deleted.
	 * @param key {String}
	 * @param value
	 * @returns {Cache}
	 */
	add(key:any, value:T):DataCache<T>{
		key = key.toString();

		let isNew = !this._values.has(key),
			valueTimeout = this._timeouts[key];

		if (valueTimeout)
			clearTimeout(valueTimeout);

		this._values.set(key, value);

		if (isNew){
			this._keys.push(key);
			if (this._keys.length > this.obj)
				this._values.delete(this._keys.shift());
		}

		if (this.time){
			let time:number = this.time instanceof Function ? this.time(value) : this.time;

			if (!isNaN(time) && time > 0) {
				this._timeouts[key] = setTimeout(() => {
					this.remove(key);
					delete this._timeouts[key];
				}, time);
			}
		}

		return this;
	}

	/**
	 * Removes an item from the cache collection.
	 * @param key
	 * @returns {*}
	 */
	remove(key:any){
		key = key.toString();

		let valueTimeout = this._timeouts[key];

		if (valueTimeout) {
			clearTimeout(valueTimeout);
			delete this._timeouts[key];
		}

		delete this._getObservable[key];

		let keyIndex = this._keys.indexOf(key);
		if (~keyIndex){
			this._keys.splice(keyIndex, 1);
			let value = this._values.get(key);
			this._values.delete(key);
			return value;
		}

		return null;
	}

	clearGetters(){
		for (let getter in this._getObservable) delete this._getObservable[getter];
	}

	private static validateSettings<T>(config?:DataCacheSettings<T>){
		if (!config)
			return;

		if (config.max < 1)
			throw new Error("Invalid max for DataCache, should be at least 2.");
	};
}

export interface DataCacheSettings<T = any>{
	max?:number,
	time?:((item:T) => number) | number,
	getter?:(_:any) => Observable<T>
}
