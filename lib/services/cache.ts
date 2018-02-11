import {Observable} from "rxjs/Observable";

export class DataCache<T>{
	time:number;
	obj:number;
	getter:(_:any, params?:{ [index:string]: any }) => Promise<T> | Observable<T>;

	private _keys:Array<string>;
	private _values:Map<string, T>;
	private _timeouts:{ [index:string]:any };
	private _getObservable:{ [index:string]:Observable<T> };

	constructor(settings?:DataCacheSettings<T>){
		DataCache.validateSettings<T>(settings);

		this.time = settings.time || null; // milliseconds
		this.obj = settings.max;
		this.getter = settings.getter;

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

		if (this.getter){
			let getObservable = this._getObservable[key];
			if (getObservable)
				return getObservable;

			let cachedItem = this._values.get(key);
			if (cachedItem)
				return Observable.of(cachedItem);

			return this._getObservable[key] = Observable.from(this.getter(key, params))
				.do((value:T) => {
					this.add(key, value);
					delete this._getObservable[key];
				});
		}
		else
			return Observable.of(this._values.get(key));
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
			this._timeouts[key] = setTimeout(() => {
				this.remove(key);
				delete this._timeouts[key];
			}, this.time);
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

export interface DataCacheSettings<T>{
	max?:number,
	time?:number,
	getter?:(_:any) => Observable<T>
}
