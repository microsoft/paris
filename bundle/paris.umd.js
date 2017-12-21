(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/add/observable/throw'), require('rxjs/add/operator/map'), require('rxjs/add/operator/catch'), require('rxjs/add/observable/of'), require('rxjs/add/observable/combineLatest'), require('rxjs/add/observable/from'), require('rxjs/add/operator/do'), require('rxjs/add/operator/mergeMap'), require('rxjs/add/operator/share'), require('rxjs/add/operator/finally'), require('rxjs/add/operator/toPromise'), require('rxjs/add/observable/merge'), require('rxjs/add/observable/dom/ajax'), require('rxjs/Observable'), require('rxjs/Subject'), require('lodash')) :
	typeof define === 'function' && define.amd ? define(['exports', 'rxjs/add/observable/throw', 'rxjs/add/operator/map', 'rxjs/add/operator/catch', 'rxjs/add/observable/of', 'rxjs/add/observable/combineLatest', 'rxjs/add/observable/from', 'rxjs/add/operator/do', 'rxjs/add/operator/mergeMap', 'rxjs/add/operator/share', 'rxjs/add/operator/finally', 'rxjs/add/operator/toPromise', 'rxjs/add/observable/merge', 'rxjs/add/observable/dom/ajax', 'rxjs/Observable', 'rxjs/Subject', 'lodash'], factory) :
	(factory((global.paris = {}),global._throw,global.map,global._catch,global.of,global.combineLatest,global.from,global._do,global.mergeMap,global.share,global._finally,global.toPromise,global.merge,global.ajax,global.Observable_1,global.Subject,global.lodash));
}(this, (function (exports,_throw,map,_catch,of,combineLatest,from,_do,mergeMap,share,_finally,toPromise,merge,ajax,Observable_1,Subject,lodash) { 'use strict';

_throw = _throw && _throw.hasOwnProperty('default') ? _throw['default'] : _throw;
map = map && map.hasOwnProperty('default') ? map['default'] : map;
_catch = _catch && _catch.hasOwnProperty('default') ? _catch['default'] : _catch;
of = of && of.hasOwnProperty('default') ? of['default'] : of;
combineLatest = combineLatest && combineLatest.hasOwnProperty('default') ? combineLatest['default'] : combineLatest;
from = from && from.hasOwnProperty('default') ? from['default'] : from;
_do = _do && _do.hasOwnProperty('default') ? _do['default'] : _do;
mergeMap = mergeMap && mergeMap.hasOwnProperty('default') ? mergeMap['default'] : mergeMap;
share = share && share.hasOwnProperty('default') ? share['default'] : share;
_finally = _finally && _finally.hasOwnProperty('default') ? _finally['default'] : _finally;
toPromise = toPromise && toPromise.hasOwnProperty('default') ? toPromise['default'] : toPromise;
merge = merge && merge.hasOwnProperty('default') ? merge['default'] : merge;
ajax = ajax && ajax.hasOwnProperty('default') ? ajax['default'] : ajax;
Observable_1 = Observable_1 && Observable_1.hasOwnProperty('default') ? Observable_1['default'] : Observable_1;
Subject = Subject && Subject.hasOwnProperty('default') ? Subject['default'] : Subject;
lodash = lodash && lodash.hasOwnProperty('default') ? lodash['default'] : lodash;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var parisConfig = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = {
    allItemsProperty: "items",
    entityIdProperty: "id"
};
});

unwrapExports(parisConfig);

var immutability = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutability = /** @class */ (function () {
    function Immutability() {
    }
    /**
     * Deep-freezes an object
     * @param {T} obj The object to freeze
     * @param {Set<any>} excluded For internal use, used to avoid infinite recursion, when a parent object is references in one of its children
     * @returns {Readonly<T>}
     */
    Immutability.freeze = function (obj, excluded) {
        if (excluded && excluded.has(obj))
            return obj;
        if (!Object.isFrozen(obj))
            Object.freeze(obj);
        if (Object(obj) === "object") {
            var childrenExcluded_1 = excluded ? new Set(excluded) : new Set;
            Object.getOwnPropertyNames(obj).forEach(function (prop) { return Immutability.freeze(obj[prop], childrenExcluded_1); });
        }
        return obj;
    };
    Immutability.unfreeze = function (obj) {
        if (Object(obj) !== obj || obj instanceof Date || obj instanceof RegExp || obj instanceof Function)
            return obj;
        var unfrozenObj = Object.create(obj.constructor.prototype);
        Object.assign(unfrozenObj, obj);
        Object.getOwnPropertyNames(obj).forEach(function (prop) {
            unfrozenObj[prop] = Immutability.unfreeze(unfrozenObj[prop]);
        });
        return unfrozenObj;
    };
    return Immutability;
}());
exports.Immutability = Immutability;
});

unwrapExports(immutability);

var entityConfig_base = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var DEFAULT_VALUE_ID = "__default";
var EntityConfigBase = /** @class */ (function () {
    function EntityConfigBase(config, entityConstructor) {
        this.entityConstructor = entityConstructor;
        this.readonly = false;
        if (config.values) {
            config.values = config.values.map(function (valueConfig) { return new entityConstructor(valueConfig); });
            immutability.Immutability.freeze(config.values);
        }
        Object.assign(this, config);
    }
    Object.defineProperty(EntityConfigBase.prototype, "fieldsArray", {
        get: function () {
            return this.fields ? Array.from(this.fields.values()) : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityConfigBase.prototype, "valuesMap", {
        get: function () {
            var _this = this;
            if (this._valuesMap === undefined) {
                if (!this.values)
                    this._valuesMap = null;
                else {
                    this._valuesMap = new Map;
                    this.values.forEach(function (value) {
                        _this._valuesMap.set(value.id === undefined || value.id === null ? DEFAULT_VALUE_ID : value.id, Object.freeze(value));
                    });
                }
            }
            return this._valuesMap;
        },
        enumerable: true,
        configurable: true
    });
    EntityConfigBase.prototype.getValueById = function (valueId) {
        return this.valuesMap ? this.valuesMap.get(valueId) : null;
    };
    EntityConfigBase.prototype.getDefaultValue = function () {
        return this.getValueById(DEFAULT_VALUE_ID) || null;
    };
    EntityConfigBase.prototype.hasValue = function (valueId) {
        return this.valuesMap ? this.valuesMap.has(valueId) : false;
    };
    return EntityConfigBase;
}());
exports.EntityConfigBase = EntityConfigBase;
});

unwrapExports(entityConfig_base);

var entity_config = createCommonjsModule(function (module, exports) {
"use strict";
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });

var ModelEntity = /** @class */ (function (_super) {
    __extends(ModelEntity, _super);
    function ModelEntity(config, entityConstructor) {
        var _this = _super.call(this, config, entityConstructor) || this;
        _this.loadAll = false;
        _this.loadAll = config.loadAll === true;
        if (!_this.endpoint && !_this.values)
            throw new Error("Can't create entity " + _this.entityConstructor.name + ", no endpoint or values defined.");
        return _this;
    }
    return ModelEntity;
}(entityConfig_base.EntityConfigBase));
exports.ModelEntity = ModelEntity;
});

unwrapExports(entity_config);

var entityField = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIELD_DATA_SELF = "__self";
});

unwrapExports(entityField);

var dataTransformers_service = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transformers = [
    {
        type: Date,
        parse: function (dateValue) { return new Date(dateValue); },
        serialize: function (date) { return date ? date.valueOf() : null; }
    },
    {
        type: RegExp,
        parse: function (pattern) { return new RegExp(pattern); },
        serialize: function (regExp) { return regExp ? regExp.toString().match(/^\/(.*)\/$/)[1] : null; }
    }
];
var transformersMap = new Map;
transformers.forEach(function (transformer) { return transformersMap.set(transformer.type, transformer); });
var DataTransformersService = /** @class */ (function () {
    function DataTransformersService() {
    }
    DataTransformersService.parse = function (type, value) {
        var transformer = transformersMap.get(type);
        return transformer ? transformer.parse(value) : value;
    };
    DataTransformersService.serialize = function (type, value) {
        var transformer = transformersMap.get(type);
        return transformer ? transformer.serialize(value) : value;
    };
    return DataTransformersService;
}());
exports.DataTransformersService = DataTransformersService;
});

unwrapExports(dataTransformers_service);

var cache = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

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
    DataCache.prototype.get = function (key) {
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
            return this._getObservable[key] = Observable_1.Observable.from(this.getter(key))
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
    
    return DataCache;
}());
exports.DataCache = DataCache;
});

unwrapExports(cache);

var entityFields_service = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntityFieldsService = /** @class */ (function () {
    function EntityFieldsService() {
        this.fields = new Map;
    }
    EntityFieldsService.prototype.addField = function (dataEntityType, field) {
        var dataTypeFields = this.getDataTypeFields(dataEntityType);
        if (!dataTypeFields)
            this.fields.set(dataEntityType, dataTypeFields = new Map);
        dataTypeFields.set(field.id, field);
    };
    EntityFieldsService.prototype.getDataTypeFields = function (dataEntityType) {
        return this.fields.get(dataEntityType) || this.fields.get(dataEntityType.prototype);
    };
    return EntityFieldsService;
}());
exports.EntityFieldsService = EntityFieldsService;
exports.entityFieldsService = new EntityFieldsService;
});

unwrapExports(entityFields_service);

var entities_service_base = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var EntitiesServiceBase = /** @class */ (function () {
    function EntitiesServiceBase() {
        this._allEntities = new Map;
    }
    Object.defineProperty(EntitiesServiceBase.prototype, "allEntities", {
        get: function () {
            return Array.from(this._allEntities.values());
        },
        enumerable: true,
        configurable: true
    });
    EntitiesServiceBase.prototype.getEntityByType = function (dataEntityType) {
        return this._allEntities.get(dataEntityType) || this._allEntities.get(dataEntityType.prototype);
    };
    EntitiesServiceBase.prototype.addEntity = function (dataEntityType, entity) {
        if (!this._allEntities.has(dataEntityType))
            this._allEntities.set(dataEntityType, entity);
        entity.fields = this.getDataEntityTypeFields(dataEntityType);
        // TODO: Clear the fields once the entity is populated, without affecting inherited fields.
        return entity;
    };
    EntitiesServiceBase.prototype.getDataEntityTypeFields = function (dataEntityType) {
        if (!dataEntityType)
            return null;
        var parentEntityDataType = Object.getPrototypeOf(dataEntityType).prototype, parentEntity = this._allEntities.get(parentEntityDataType), parentDataTypeFields = parentEntity && parentEntity.fields || this.getDataEntityTypeFields(parentEntityDataType) || null;
        var fullDataEntityTypeFields = new Map;
        if (parentDataTypeFields)
            parentDataTypeFields.forEach(function (field, fieldId) { return fullDataEntityTypeFields.set(fieldId, field); });
        var dataEntity = this.getEntityByType(dataEntityType);
        var dataEntityTypeFields = dataEntity && dataEntity.fields || entityFields_service.entityFieldsService.getDataTypeFields(dataEntityType);
        if (dataEntityTypeFields)
            dataEntityTypeFields.forEach(function (field, fieldId) { return fullDataEntityTypeFields.set(fieldId, field); });
        return fullDataEntityTypeFields;
    };
    return EntitiesServiceBase;
}());
exports.EntitiesServiceBase = EntitiesServiceBase;
});

unwrapExports(entities_service_base);

var valueObjects_service = createCommonjsModule(function (module, exports) {
"use strict";
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });

var ValueObjectsService = /** @class */ (function (_super) {
    __extends(ValueObjectsService, _super);
    function ValueObjectsService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ValueObjectsService;
}(entities_service_base.EntitiesServiceBase));
exports.ValueObjectsService = ValueObjectsService;
exports.valueObjectsService = new ValueObjectsService;
});

unwrapExports(valueObjects_service);

var dataAvailability_enum = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataAvailability;
(function (DataAvailability) {
    DataAvailability[DataAvailability["deep"] = 0] = "deep";
    DataAvailability[DataAvailability["flat"] = 1] = "flat";
    DataAvailability[DataAvailability["available"] = 2] = "available";
})(DataAvailability = exports.DataAvailability || (exports.DataAvailability = {}));
});

unwrapExports(dataAvailability_enum);

var data_options = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

exports.defaultDataOptions = {
    allowCache: true,
    availability: dataAvailability_enum.DataAvailability.deep
};
});

unwrapExports(data_options);

var dataQuerySort = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataQuerySortDirection;
(function (DataQuerySortDirection) {
    DataQuerySortDirection[DataQuerySortDirection["ascending"] = 0] = "ascending";
    DataQuerySortDirection[DataQuerySortDirection["descending"] = 1] = "descending";
})(DataQuerySortDirection = exports.DataQuerySortDirection || (exports.DataQuerySortDirection = {}));
});

unwrapExports(dataQuerySort);

var dataset_service = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var DatasetService = /** @class */ (function () {
    function DatasetService() {
    }
    DatasetService.queryToHttpOptions = function (query) {
        if (!query)
            return null;
        var httpOptions = {};
        httpOptions.params = {};
        if (query.pageSize && query.pageSize > 0)
            httpOptions.params.pagesize = query.pageSize;
        if (query.page && query.page > 1)
            httpOptions.params.page = query.page;
        if (query.sortBy) {
            httpOptions.params.sortBy = query.sortBy.map(function (sortField) {
                return "" + (sortField.direction === dataQuerySort.DataQuerySortDirection.descending ? '-' : '') + sortField.field;
            }).join(",");
        }
        if (query.where)
            Object.assign(httpOptions.params, query.where);
        return httpOptions;
    };
    return DatasetService;
}());
exports.DatasetService = DatasetService;
});

unwrapExports(dataset_service);

var errors_service = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorsService = /** @class */ (function () {
    function ErrorsService() {
    }
    ErrorsService.warn = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return console && console.warn.apply(console, ["Paris warning: "].concat(items));
    };
    return ErrorsService;
}());
exports.ErrorsService = ErrorsService;
});

unwrapExports(errors_service);

var repository = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });












var Repository = /** @class */ (function () {
    function Repository(entity, config, entityConstructor, dataStore, paris) {
        this.entity = entity;
        this.config = config;
        this.entityConstructor = entityConstructor;
        this.dataStore = dataStore;
        this.paris = paris;
        var getAllItems$ = this.query().map(function (dataSet) { return dataSet.items; });
        this._allItemsSubject$ = new Subject.Subject();
        this._allItems$ = Observable_1.Observable.merge(getAllItems$, this._allItemsSubject$.asObservable());
        this._saveSubject$ = new Subject.Subject();
        this.save$ = this._saveSubject$.asObservable();
    }
    Object.defineProperty(Repository.prototype, "allItems$", {
        get: function () {
            if (this._allValues)
                return Observable_1.Observable.merge(Observable_1.Observable.of(this._allValues), this._allItemsSubject$.asObservable());
            if (this.entity.loadAll)
                return this.setAllItems();
            return this._allItems$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "cache", {
        get: function () {
            var _this = this;
            if (!this._cache) {
                var cacheSettings = Object.assign({
                    getter: function (itemId) { return _this.getItemById(itemId, { allowCache: false }); }
                }, this.entity.cache);
                this._cache = new cache.DataCache(cacheSettings);
            }
            return this._cache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "baseUrl", {
        get: function () {
            if (!this.entity.baseUrl)
                return null;
            return this.entity.baseUrl instanceof Function ? this.entity.baseUrl(this.config) : this.entity.baseUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "endpointName", {
        get: function () {
            return this.entity.endpoint instanceof Function ? this.entity.endpoint(this.config) : this.entity.endpoint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "endpointUrl", {
        get: function () {
            return this.baseUrl + "/" + this.endpointName;
        },
        enumerable: true,
        configurable: true
    });
    Repository.prototype.createItem = function (itemData, options) {
        if (options === void 0) { options = { allowCache: true, availability: dataAvailability_enum.DataAvailability.available }; }
        return Repository.getModelData(itemData, this.entity, this.config, this.paris, options);
    };
    Repository.prototype.createNewItem = function () {
        return new this.entityConstructor();
    };
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
    Repository.getModelData = function (rawData, entity, config, paris, options) {
        if (options === void 0) { options = data_options.defaultDataOptions; }
        var entityIdProperty = entity.idProperty || config.entityIdProperty, modelData = entity instanceof entity_config.ModelEntity ? { id: rawData[entityIdProperty] } : {}, subModels = [];
        var getModelDataError = new Error("Failed to create " + entity.singularName + ".");
        entity.fields.forEach(function (entityField$$1) {
            if (entityField$$1.require) {
                var failed = false;
                if (entityField$$1.require instanceof Function && !entityField$$1.require(rawData, paris.config))
                    failed = true;
                else if (typeof (entityField$$1.require) === "string") {
                    var rawDataPropertyValue = rawData[entityField$$1.require];
                    if (rawDataPropertyValue === undefined || rawDataPropertyValue === null)
                        failed = true;
                }
                if (failed) {
                    modelData[entityField$$1.id] = null;
                    return;
                }
            }
            var propertyValue;
            if (entityField$$1.data) {
                if (entityField$$1.data instanceof Array) {
                    for (var i = 0, path = void 0; i < entityField$$1.data.length && propertyValue === undefined; i++) {
                        path = entityField$$1.data[i];
                        var value = path === entityField.FIELD_DATA_SELF ? rawData : lodash.get(rawData, path);
                        if (value !== undefined && value !== null)
                            propertyValue = value;
                    }
                }
                else
                    propertyValue = entityField$$1.data === entityField.FIELD_DATA_SELF ? rawData : lodash.get(rawData, entityField$$1.data);
            }
            else
                propertyValue = rawData[entityField$$1.id];
            if (entityField$$1.parse) {
                try {
                    propertyValue = entityField$$1.parse(propertyValue, rawData);
                }
                catch (e) {
                    getModelDataError.message = getModelDataError.message + (" Error parsing field " + entityField$$1.id + ": ") + e.message;
                    throw getModelDataError;
                }
            }
            if (propertyValue === undefined || propertyValue === null) {
                var fieldRepository = paris.getRepository(entityField$$1.type);
                var fieldValueObjectType = !fieldRepository && valueObjects_service.valueObjectsService.getEntityByType(entityField$$1.type);
                var defaultValue = fieldRepository && fieldRepository.entity.getDefaultValue()
                    || fieldValueObjectType && fieldValueObjectType.getDefaultValue()
                    || (entityField$$1.isArray ? [] : entityField$$1.defaultValue || null);
                if (!defaultValue && entityField$$1.required) {
                    getModelDataError.message = getModelDataError.message + (" Field " + entityField$$1.id + " is required but it's " + propertyValue + ".");
                    throw getModelDataError;
                }
                modelData[entityField$$1.id] = defaultValue;
            }
            else {
                var getPropertyEntityValue$ = Repository.getSubModel(entityField$$1, propertyValue, paris, config, options);
                if (getPropertyEntityValue$)
                    subModels.push(getPropertyEntityValue$);
                else {
                    modelData[entityField$$1.id] = entityField$$1.isArray
                        ? propertyValue
                            ? propertyValue.map(function (elementValue) { return dataTransformers_service.DataTransformersService.parse(entityField$$1.type, elementValue); })
                            : []
                        : dataTransformers_service.DataTransformersService.parse(entityField$$1.type, propertyValue);
                }
            }
        });
        var model$;
        if (subModels.length) {
            model$ = Observable_1.Observable.combineLatest.apply(Observable_1.Observable, subModels).map(function (propertyEntityValues) {
                propertyEntityValues.forEach(function (propertyEntityValue) { return Object.assign(modelData, propertyEntityValue); });
                var model;
                try {
                    model = new entity.entityConstructor(modelData, rawData);
                }
                catch (e) {
                    getModelDataError.message = getModelDataError.message + " Error: " + e.message;
                    throw getModelDataError;
                }
                propertyEntityValues.forEach(function (modelPropertyValue) {
                    for (var p in modelPropertyValue) {
                        var modelValue = modelPropertyValue[p];
                        if (modelValue instanceof Array)
                            modelValue.forEach(function (modelValueItem) {
                                if (!Object.isFrozen(modelValueItem))
                                    modelValueItem.$parent = model;
                            });
                        else if (!Object.isFrozen(modelValue))
                            modelValue.$parent = model;
                    }
                });
                return model;
            });
        }
        else {
            var model = void 0;
            try {
                model = new entity.entityConstructor(modelData, rawData);
            }
            catch (e) {
                getModelDataError.message = getModelDataError.message + " Error: " + e.message;
                throw getModelDataError;
            }
            model$ = Observable_1.Observable.of(model);
        }
        return entity.readonly ? model$.map(function (model) { return Object.freeze(model); }) : model$;
    };
    Repository.getSubModel = function (entityField$$1, value, paris, config, options) {
        if (options === void 0) { options = data_options.defaultDataOptions; }
        var getPropertyEntityValue$;
        var mapValueToEntityFieldIndex = Repository.mapToEntityFieldIndex.bind(null, entityField$$1.id);
        var repository = paris.getRepository(entityField$$1.type);
        var valueObjectType = !repository && valueObjects_service.valueObjectsService.getEntityByType(entityField$$1.type);
        if (!repository && !valueObjectType)
            return null;
        var getItem = repository
            ? Repository.getEntityItem.bind(null, repository)
            : Repository.getValueObjectItem.bind(null, valueObjectType);
        if (entityField$$1.isArray) {
            if (value.length) {
                var propertyMembers$ = value.map(function (memberData) { return getItem(memberData, options, paris, config); });
                getPropertyEntityValue$ = Observable_1.Observable.combineLatest.apply(Observable_1.Observable, propertyMembers$).map(mapValueToEntityFieldIndex);
            }
            else
                getPropertyEntityValue$ = Observable_1.Observable.of([]).map(mapValueToEntityFieldIndex);
        }
        else
            getPropertyEntityValue$ = getItem(value, options, paris, config)
                .map(mapValueToEntityFieldIndex);
        return getPropertyEntityValue$;
    };
    Repository.mapToEntityFieldIndex = function (entityFieldId, value) {
        var data = {};
        data[entityFieldId] = value;
        return data;
    };
    Repository.getEntityItem = function (repository, data, options) {
        if (options === void 0) { options = data_options.defaultDataOptions; }
        return Object(data) === data ? repository.createItem(data, options) : repository.getItemById(data, options);
    };
    Repository.getValueObjectItem = function (valueObjectType, data, options, paris, config) {
        if (options === void 0) { options = data_options.defaultDataOptions; }
        // If the value object is one of a list of values, just set it to the model
        if (valueObjectType.values)
            return Observable_1.Observable.of(valueObjectType.getValueById(data) || valueObjectType.getDefaultValue() || null);
        return Repository.getModelData(data, valueObjectType, config, paris, options);
    };
    Repository.prototype.query = function (query, dataOptions) {
        var _this = this;
        if (dataOptions === void 0) { dataOptions = data_options.defaultDataOptions; }
        var queryError = new Error("Failed to get " + this.entity.pluralName + ".");
        var httpOptions = this.entity.parseDataQuery ? { params: this.entity.parseDataQuery(query) } : dataset_service.DatasetService.queryToHttpOptions(query);
        return this.dataStore.get("" + this.endpointName + (this.entity.allItemsEndpointTrailingSlash !== false && !this.entity.allItemsEndpoint ? '/' : '') + (this.entity.allItemsEndpoint || ''), httpOptions, this.baseUrl)
            .map(function (rawDataSet) {
            var allItemsProperty = _this.entity.allItemsProperty || _this.config.allItemsProperty;
            var rawItems = rawDataSet instanceof Array ? rawDataSet : rawDataSet[allItemsProperty];
            if (!rawItems)
                errors_service.ErrorsService.warn("Property '" + _this.config.allItemsProperty + "' wasn't found in DataSet for Entity '" + _this.entity.pluralName + "'.");
            return {
                count: rawDataSet.count,
                items: rawItems
            };
        })
            .flatMap(function (dataSet) {
            var itemCreators = dataSet.items.map(function (itemData) { return _this.createItem(itemData, dataOptions); });
            return Observable_1.Observable.combineLatest.apply(_this, itemCreators).map(function (items) {
                return Object.freeze({
                    count: dataSet.count,
                    items: items
                });
            }).catch(function (error) {
                queryError.message = queryError.message + " Error: " + error.message;
                throw queryError;
            });
        });
    };
    Repository.prototype.getItemById = function (itemId, options, params) {
        var _this = this;
        if (options === void 0) { options = data_options.defaultDataOptions; }
        if (this.entity.values) {
            var entityValue = void 0;
            if (itemId !== null && itemId !== undefined) {
                if (this.entity.hasValue(itemId))
                    entityValue = this.entity.getValueById(itemId);
                else
                    errors_service.ErrorsService.warn("Unknown value for " + this.entity.singularName + ": ", itemId);
            }
            return Observable_1.Observable.of(entityValue || this.entity.getDefaultValue());
        }
        if (options.allowCache !== false && this.entity.cache)
            return this.cache.get(itemId);
        if (this.entity.loadAll)
            return this.setAllItems().map(function () { return _this._allValuesMap.get(String(itemId)); });
        else {
            return this.dataStore.get(this.entity.parseItemQuery ? this.entity.parseItemQuery(itemId, this.entity, this.config) : this.endpointName + "/" + itemId, params && { params: params }, this.baseUrl)
                .flatMap(function (data) { return _this.createItem(data, options); });
        }
    };
    Repository.prototype.setAllItems = function () {
        var _this = this;
        if (this._allValues)
            return Observable_1.Observable.of(this._allValues);
        return this.query().do(function (dataSet) {
            _this._allValues = dataSet.items;
            _this._allValuesMap = new Map();
            _this._allValues.forEach(function (value) { return _this._allValuesMap.set(String(value.id), value); });
        }).map(function (dataSet) { return dataSet.items; });
    };
    /**
     * Saves an entity to the server
     * @param {T} item
     * @returns {Observable<T extends EntityModelBase>}
     */
    Repository.prototype.save = function (item) {
        var _this = this;
        if (!this.entity.endpoint)
            throw new Error("Entity " + this.entity.entityConstructor.name + " can be saved - it doesn't specify an endpoint.");
        try {
            var saveData = this.serializeItem(item);
            return this.dataStore.save(this.entity.endpoint + "/" + (item.id || ''), item.id === undefined ? "POST" : "PUT", { data: saveData })
                .flatMap(function (savedItemData) { return _this.createItem(savedItemData); })
                .do(function (item) {
                if (_this._allValues) {
                    _this._allValues = _this._allValues.concat([item]);
                    _this._allItemsSubject$.next(_this._allValues);
                }
                _this._saveSubject$.next(item);
            });
        }
        catch (e) {
            return Observable_1.Observable.throw(e);
        }
    };
    /**
     * Validates that the specified item is valid, according to the requirements of the entity (or value object) it belongs to.
     * @param item
     * @param {EntityConfigBase} entity
     * @returns {boolean}
     */
    Repository.validateItem = function (item, entity) {
        entity.fields.forEach(function (entityField$$1) {
            var itemFieldValue = item[entityField$$1.id];
            if (entityField$$1.required && (itemFieldValue === undefined || itemFieldValue === null))
                throw new Error("Missing value for field '" + entityField$$1.id + "'");
        });
        return true;
    };
    /**
     * Creates a JSON object that can be saved to server, with the reverse logic of getItemModelData
     * @param {T} item
     * @returns {Index}
     */
    Repository.prototype.serializeItem = function (item) {
        Repository.validateItem(item, this.entity);
        return Repository.serializeItem(item, this.entity, this.paris);
    };
    /**
     * Serializes an object value
     * @param item
     * @returns {Index}
     */
    Repository.serializeItem = function (item, entity, paris) {
        Repository.validateItem(item, entity);
        var modelData = {};
        entity.fields.forEach(function (entityField$$1) {
            var itemFieldValue = item[entityField$$1.id], fieldRepository = paris.getRepository(entityField$$1.type), fieldValueObjectType = !fieldRepository && valueObjects_service.valueObjectsService.getEntityByType(entityField$$1.type), isNilValue = itemFieldValue === undefined || itemFieldValue === null;
            var modelValue;
            if (entityField$$1.isArray)
                modelValue = itemFieldValue ? itemFieldValue.map(function (element) { return Repository.serializeItem(element, fieldRepository ? fieldRepository.entity : fieldValueObjectType, paris); }) : null;
            else if (fieldRepository)
                modelValue = isNilValue ? fieldRepository.entity.getDefaultValue() || null : itemFieldValue.id;
            else if (fieldValueObjectType)
                modelValue = isNilValue ? fieldValueObjectType.getDefaultValue() || null : Repository.serializeItem(itemFieldValue, fieldValueObjectType, paris);
            else
                modelValue = dataTransformers_service.DataTransformersService.serialize(entityField$$1.type, itemFieldValue);
            var modelProperty = entityField$$1.data
                ? entityField$$1.data instanceof Array ? entityField$$1.data[0] : entityField$$1.data
                : entityField$$1.id;
            modelData[modelProperty] = modelValue;
        });
        return modelData;
    };
    return Repository;
}());
exports.Repository = Repository;
});

unwrapExports(repository);

var entities_service = createCommonjsModule(function (module, exports) {
"use strict";
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });

var EntitiesService = /** @class */ (function (_super) {
    __extends(EntitiesService, _super);
    function EntitiesService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EntitiesService;
}(entities_service_base.EntitiesServiceBase));
exports.EntitiesService = EntitiesService;
exports.entitiesService = new EntitiesService();
});

unwrapExports(entities_service);

var http_service = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var Http = /** @class */ (function () {
    function Http() {
    }
    Http.get = function (url, options, httpConfig) {
        return Http.request("GET", url, options, httpConfig);
    };
    Http.post = function (url, options, httpConfig) {
        return Http.request("POST", url, options, httpConfig);
    };
    Http.put = function (url, options, httpConfig) {
        return Http.request("PUT", url, options, httpConfig);
    };
    Http.delete = function (url, options, httpConfig) {
        return Http.request("DELETE", url, options, httpConfig);
    };
    Http.patch = function (url, options, httpConfig) {
        return Http.request("PATCH", url, options, httpConfig);
    };
    Http.request = function (method, url, options, httpConfig) {
        var fullUrl = options && options.params ? Http.addParamsToUrl(url, options.params) : url, tmpError = new Error("Failed to " + method + " from " + url + ".");
        if (options && options.data) {
            httpConfig = httpConfig || {};
            if (!httpConfig.headers)
                httpConfig.headers = {};
            httpConfig.headers["Content-Type"] = "application/json";
        }
        return Observable_1.Observable.ajax(Object.assign({
            method: method,
            url: fullUrl,
            body: options && options.data
        }, Http.httpOptionsToRequestInit(options, httpConfig)))
            .map(function (e) { return e.response; })
            .catch(function () { throw tmpError; });
    };
    Http.httpOptionsToRequestInit = function (options, httpConfig) {
        if (!options && !httpConfig)
            return null;
        var requestOptions = {};
        if (options) {
            if (options.data)
                requestOptions.body = options.data;
        }
        if (httpConfig) {
            if (httpConfig.headers)
                requestOptions.headers = httpConfig.headers;
        }
        return requestOptions;
    };
    Http.addParamsToUrl = function (url, params) {
        if (params && !/\?/.test(url))
            return url + "?" + Http.getParamsQuery(params);
        return params && !/\?/.test(url) ? url + "?" + Http.getParamsQuery(params) : url;
    };
    Http.getParamsQuery = function (params) {
        var paramsArray = [];
        for (var param in params) {
            var value = encodeURIComponent(String(params[param]));
            paramsArray.push(param + "=" + value);
        }
        return paramsArray.join("&");
    };
    return Http;
}());
exports.Http = Http;
});

unwrapExports(http_service);

var dataStore_service = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


var DataStoreService = /** @class */ (function () {
    function DataStoreService(config) {
        this.config = config;
        this.activeRequests = new Map();
    }
    DataStoreService.prototype.get = function (endpoint, data, baseUrl) {
        return this.setActiveRequest(Observable_1.Observable.from(http_service.Http.get(this.getEndpointUrl(endpoint, baseUrl), data, this.config.http)), "GET", endpoint, data);
    };
    DataStoreService.prototype.save = function (endpoint, method, data, baseUrl) {
        if (method === void 0) { method = "POST"; }
        return http_service.Http.request(method, this.getEndpointUrl(endpoint, baseUrl), data, this.config.http);
    };
    DataStoreService.prototype.getEndpointUrl = function (endpoint, baseUrl) {
        return (baseUrl || this.config.apiRoot || "") + "/" + endpoint;
    };
    DataStoreService.prototype.setActiveRequest = function (obs, method, endpoint, data) {
        var _this = this;
        var activeRequestId = DataStoreService.getActiveRequestId(method, endpoint, data), existingActiveRequest = this.activeRequests.get(activeRequestId);
        if (existingActiveRequest)
            return existingActiveRequest;
        else {
            var warmObservable = obs.share();
            obs.finally(function () { return _this.activeRequests.delete(activeRequestId); });
            this.activeRequests.set(activeRequestId, warmObservable);
            return warmObservable;
        }
    };
    DataStoreService.getActiveRequestId = function (method, endpoint, data) {
        return method + "__" + endpoint + "__" + (data ? JSON.stringify(data) : '|');
    };
    return DataStoreService;
}());
exports.DataStoreService = DataStoreService;
});

unwrapExports(dataStore_service);

var paris = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });




var Paris = /** @class */ (function () {
    function Paris(config) {
        this.repositories = new Map();
        this.config = Object.assign({}, parisConfig.defaultConfig, config);
        this.dataStore = new dataStore_service.DataStoreService(this.config);
    }
    Paris.prototype.getRepository = function (entityConstructor) {
        var repository$$1 = this.repositories.get(entityConstructor);
        if (!repository$$1) {
            var entityConfig = entities_service.entitiesService.getEntityByType(entityConstructor);
            if (!entityConfig)
                return null;
            repository$$1 = new repository.Repository(entityConfig, this.config, entityConstructor, this.dataStore, this);
            this.repositories.set(entityConstructor, repository$$1);
        }
        return repository$$1;
    };
    Paris.prototype.getModelBaseConfig = function (entityConstructor) {
        return entityConstructor.entityConfig || entityConstructor.valueObjectConfig;
    };
    return Paris;
}());
exports.Paris = Paris;
});

unwrapExports(paris);

var model_base = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelBase = /** @class */ (function () {
    function ModelBase(data) {
        if (data) {
            Object.assign(this, data);
        }
    }
    return ModelBase;
}());
exports.ModelBase = ModelBase;
});

unwrapExports(model_base);

var entityField_decorator = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function EntityField(fieldConfig) {
    return function (entityPrototype, propertyKey) {
        var propertyConstructor = window['Reflect'].getMetadata("design:type", entityPrototype, propertyKey);
        fieldConfig = fieldConfig || {};
        var fieldConfigCopy = Object.assign({}, fieldConfig);
        if (!fieldConfigCopy.id)
            fieldConfigCopy.id = String(propertyKey);
        fieldConfigCopy.type = fieldConfig.arrayOf || propertyConstructor;
        fieldConfigCopy.isArray = propertyConstructor === Array;
        entityFields_service.entityFieldsService.addField(entityPrototype, fieldConfigCopy);
    };
}
exports.EntityField = EntityField;
});

unwrapExports(entityField_decorator);

var entityModel_base = createCommonjsModule(function (module, exports) {
"use strict";
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (commonjsGlobal && commonjsGlobal.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (commonjsGlobal && commonjsGlobal.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });


var EntityModelBase = /** @class */ (function (_super) {
    __extends(EntityModelBase, _super);
    function EntityModelBase(data) {
        return _super.call(this, data) || this;
    }
    __decorate([
        entityField_decorator.EntityField(),
        __metadata("design:type", Object)
    ], EntityModelBase.prototype, "id", void 0);
    return EntityModelBase;
}(model_base.ModelBase));
exports.EntityModelBase = EntityModelBase;
});

unwrapExports(entityModel_base);

var valueObject_decorator = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


function ValueObject(config) {
    return function (target) {
        var valueObjectConfig = new entityConfig_base.EntityConfigBase(config, target.prototype.constructor);
        target.valueObjectConfig = valueObjectConfig;
        valueObjects_service.valueObjectsService.addEntity(target, valueObjectConfig);
    };
}
exports.ValueObject = ValueObject;
});

unwrapExports(valueObject_decorator);

var entity_decorator = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


function Entity(config) {
    return function (target) {
        var entity = new entity_config.ModelEntity(config, target.prototype.constructor);
        target.entityConfig = entity;
        entities_service.entitiesService.addEntity(target, entity);
    };
}
exports.Entity = Entity;
});

unwrapExports(entity_decorator);

var main = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });














exports.Paris = paris.Paris;

exports.DataStoreService = dataStore_service.DataStoreService;

exports.EntityModelBase = entityModel_base.EntityModelBase;

exports.ModelBase = model_base.ModelBase;

exports.Repository = repository.Repository;

exports.DataTransformersService = dataTransformers_service.DataTransformersService;

exports.ModelEntity = entity_config.ModelEntity;

exports.EntityField = entityField_decorator.EntityField;

exports.ValueObject = valueObject_decorator.ValueObject;

exports.Entity = entity_decorator.Entity;

exports.DataQuerySortDirection = dataQuerySort.DataQuerySortDirection;

exports.DataAvailability = dataAvailability_enum.DataAvailability;
});

var main$1 = unwrapExports(main);
var main_1 = main.Paris;
var main_2 = main.DataStoreService;
var main_3 = main.EntityModelBase;
var main_4 = main.ModelBase;
var main_5 = main.Repository;
var main_6 = main.DataTransformersService;
var main_7 = main.ModelEntity;
var main_8 = main.EntityField;
var main_9 = main.ValueObject;
var main_10 = main.Entity;
var main_11 = main.DataQuerySortDirection;
var main_12 = main.DataAvailability;

exports['default'] = main$1;
exports.Paris = main_1;
exports.DataStoreService = main_2;
exports.EntityModelBase = main_3;
exports.ModelBase = main_4;
exports.Repository = main_5;
exports.DataTransformersService = main_6;
exports.ModelEntity = main_7;
exports.EntityField = main_8;
exports.ValueObject = main_9;
exports.Entity = main_10;
exports.DataQuerySortDirection = main_11;
exports.DataAvailability = main_12;

Object.defineProperty(exports, '__esModule', { value: true });

})));
