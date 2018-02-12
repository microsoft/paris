"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var DataCache = /** @class */ (function () {
    function DataCache(settings) {
        DataCache.validateSettings(settings);
        this.time = settings.time || null; // milliseconds
        this.obj = settings.max;
        this.getter = settings.getter;
        this._keys = [];
        this._values = new Map();
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
    DataCache.prototype.get = function (key, params) {
        var _this = this;
        if (!key && key !== 0)
            throw new Error("Can't get DataCache item, key not specified.");
        key = key.toString();
        if (this.getter) {
            var getObservable = this._getObservable[key];
            if (getObservable)
                return getObservable;
            var cachedItem = this._values.get(key);
            if (cachedItem)
                return Observable_1.Observable.of(cachedItem);
            return this._getObservable[key] = Observable_1.Observable.from(this.getter(key, params))
                .do(function (value) {
                _this.add(key, value);
                delete _this._getObservable[key];
            });
        }
        else
            return Observable_1.Observable.of(this._values.get(key));
    };
    /**
     * Adds an item to the Cached collection. If DataCache.time was specified, the item will expire after this time (in milliseconds), and will be deleted.
     * @param key {String}
     * @param value
     * @returns {Cache}
     */
    DataCache.prototype.add = function (key, value) {
        var _this = this;
        key = key.toString();
        var isNew = !this._values.has(key), valueTimeout = this._timeouts[key];
        if (valueTimeout)
            clearTimeout(valueTimeout);
        this._values.set(key, value);
        if (isNew) {
            this._keys.push(key);
            if (this._keys.length > this.obj)
                this._values.delete(this._keys.shift());
        }
        if (this.time) {
            this._timeouts[key] = setTimeout(function () {
                _this.remove(key);
                delete _this._timeouts[key];
            }, this.time);
        }
        return this;
    };
    /**
     * Removes an item from the cache collection.
     * @param key
     * @returns {*}
     */
    DataCache.prototype.remove = function (key) {
        key = key.toString();
        var valueTimeout = this._timeouts[key];
        if (valueTimeout) {
            clearTimeout(valueTimeout);
            delete this._timeouts[key];
        }
        delete this._getObservable[key];
        var keyIndex = this._keys.indexOf(key);
        if (~keyIndex) {
            this._keys.splice(keyIndex, 1);
            var value = this._values.get(key);
            this._values.delete(key);
            return value;
        }
        return null;
    };
    DataCache.prototype.clearGetters = function () {
        for (var getter in this._getObservable)
            delete this._getObservable[getter];
    };
    DataCache.validateSettings = function (config) {
        if (!config)
            return;
        if (config.max < 1)
            throw new Error("Invalid max for DataCache, should be at least 2.");
    };
    ;
    return DataCache;
}());
exports.DataCache = DataCache;
