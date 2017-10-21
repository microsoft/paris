(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/Observable'), require('rxjs/Subject'), require('@angular/core'), require('@angular/common/http'), require('rxjs/add/observable/throw'), require('rxjs/add/operator/map'), require('rxjs/add/operator/catch'), require('rxjs/add/observable/of'), require('rxjs/add/observable/combineLatest'), require('rxjs/add/observable/from'), require('rxjs/add/operator/do'), require('rxjs/add/operator/mergeMap'), require('rxjs/add/operator/share'), require('rxjs/add/operator/finally'), require('rxjs/add/operator/toPromise'), require('rxjs/add/observable/merge')) :
	typeof define === 'function' && define.amd ? define(['exports', 'rxjs/Observable', 'rxjs/Subject', '@angular/core', '@angular/common/http', 'rxjs/add/observable/throw', 'rxjs/add/operator/map', 'rxjs/add/operator/catch', 'rxjs/add/observable/of', 'rxjs/add/observable/combineLatest', 'rxjs/add/observable/from', 'rxjs/add/operator/do', 'rxjs/add/operator/mergeMap', 'rxjs/add/operator/share', 'rxjs/add/operator/finally', 'rxjs/add/operator/toPromise', 'rxjs/add/observable/merge'], factory) :
	(factory((global.paris = {}),global.Observable,global.Subject,global.core,global.http,global._throw,global.map,global._catch,global.of,global.combineLatest,global.from,global._do,global.mergeMap,global.share,global._finally,global.toPromise,global.merge));
}(this, (function (exports,Observable,Subject,core,http,_throw,map,_catch,of,combineLatest,from,_do,mergeMap,share,_finally,toPromise,merge) { 'use strict';

Observable = Observable && Observable.hasOwnProperty('default') ? Observable['default'] : Observable;
Subject = Subject && Subject.hasOwnProperty('default') ? Subject['default'] : Subject;
core = core && core.hasOwnProperty('default') ? core['default'] : core;
http = http && http.hasOwnProperty('default') ? http['default'] : http;
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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var dataTransformers_service = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transformers = [
    {
        type: Date,
        parse: function (dateValue) { return new Date(dateValue); },
        serialize: function (date) { return date.valueOf(); }
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
                return Observable.Observable.of(cachedItem);
            return this._getObservable[key] = Observable.Observable.from(this.getter(key))
                .do(function (value) {
                _this.add(key, value);
                delete _this._getObservable[key];
            });
        }
        else
            return Observable.Observable.of(this._values.get(key));
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
    EntitiesServiceBase.prototype.getEntityByPluralName = function (pluralName) {
        var allEntities = Array.from(this._allEntities.keys()), pluralNameLowerCase = pluralName.toLowerCase();
        for (var i = 0, entity = void 0; entity = allEntities[i]; i++) {
            if (entity.entityConfig.pluralName.toLowerCase() === pluralNameLowerCase)
                return entity;
        }
        return null;
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

var objectValues_service = createCommonjsModule(function (module, exports) {
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

var ObjectValuesService = /** @class */ (function (_super) {
    __extends(ObjectValuesService, _super);
    function ObjectValuesService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ObjectValuesService;
}(entities_service_base.EntitiesServiceBase));
exports.ObjectValuesService = ObjectValuesService;
exports.objectValuesService = new ObjectValuesService;
});

unwrapExports(objectValues_service);

var repository = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });





var Repository = /** @class */ (function () {
    function Repository(entity, config, entityConstructor, dataStore, repositoryManagerService) {
        this.entity = entity;
        this.config = config;
        this.entityConstructor = entityConstructor;
        this.dataStore = dataStore;
        this.repositoryManagerService = repositoryManagerService;
        var getAllItems$ = this.getItemsDataSet().map(function (dataSet) { return dataSet.items; });
        this._allItemsSubject$ = new Subject.Subject();
        this._allItems$ = Observable.Observable.merge(getAllItems$, this._allItemsSubject$.asObservable());
        this._saveSubject$ = new Subject.Subject();
        this.save$ = this._saveSubject$.asObservable();
    }
    Object.defineProperty(Repository.prototype, "allItems$", {
        get: function () {
            if (this._allValues)
                return Observable.Observable.merge(Observable.Observable.of(this._allValues), this._allItemsSubject$.asObservable());
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
                    getter: function (itemId) { return _this.getItemById(itemId, false); }
                }, this.entity.cache);
                this._cache = new cache.DataCache(cacheSettings);
            }
            return this._cache;
        },
        enumerable: true,
        configurable: true
    });
    Repository.prototype.createItem = function (itemData) {
        var _this = this;
        return this.getModelData(itemData)
            .map(function (modelData) { return new _this.entityConstructor(modelData); });
    };
    Repository.prototype.createNewItem = function () {
        return new this.entityConstructor();
    };
    /**
     * Populates the item dataset with any sub @model. For example, if an ID is found for a property whose type is an entity,
     * the property's value will be an instance of that entity, for the ID, not the ID.
     * @param itemData
     * @returns {Observable<ModelData>}
     */
    Repository.prototype.getModelData = function (itemData) {
        var _this = this;
        var modelData = { $key: itemData[this.entity.idProperty || this.config.entityIdProperty] }, subModels = [];
        this.entity.fields.forEach(function (entityField) {
            var propertyValue = itemData[entityField.data || entityField.id];
            if (propertyValue === undefined || propertyValue === null) {
                modelData[entityField.id] = entityField.defaultValue || null;
            }
            else {
                var propertyRepository_1 = _this.repositoryManagerService.getRepository(entityField.type);
                if (propertyRepository_1) {
                    var getPropertyEntityValue$ = void 0;
                    var mapValueToEntityFieldIndex = Repository.mapToEntityFieldIndex.bind(_this, entityField.id);
                    if (entityField.isArray) {
                        var propertyMembers$ = propertyValue.map(function (memberData) { return _this.getEntityItem(propertyRepository_1, memberData); });
                        getPropertyEntityValue$ = Observable.Observable.combineLatest.apply(_this, propertyMembers$).map(mapValueToEntityFieldIndex);
                    }
                    else {
                        getPropertyEntityValue$ = _this.getEntityItem(propertyRepository_1, propertyValue).map(mapValueToEntityFieldIndex);
                    }
                    subModels.push(getPropertyEntityValue$);
                }
                else {
                    var objectValueType = objectValues_service.objectValuesService.getEntityByType(entityField.type);
                    if (objectValueType)
                        modelData[entityField.id] = objectValueType.getValueById(propertyValue) || propertyValue;
                    else {
                        modelData[entityField.id] = entityField.isArray
                            ? propertyValue ? propertyValue.map(function (elementValue) { return dataTransformers_service.DataTransformersService.parse(entityField.type, elementValue); }) : []
                            : dataTransformers_service.DataTransformersService.parse(entityField.type, propertyValue);
                    }
                }
            }
        });
        if (subModels.length) {
            return Observable.Observable.combineLatest.apply(this, subModels).map(function (propertyEntityValues) {
                propertyEntityValues.forEach(function (propertyEntityValue) { return Object.assign(modelData, propertyEntityValue); });
                return new _this.entityConstructor(modelData);
            });
        }
        else
            return Observable.Observable.of(modelData);
    };
    Repository.mapToEntityFieldIndex = function (entityFieldId, value) {
        var data = {};
        data[entityFieldId] = value;
        return data;
    };
    Repository.prototype.getEntityItem = function (repository, itemData) {
        return Object(itemData) === itemData ? repository.createItem(itemData) : repository.getItemById(itemData);
    };
    Repository.prototype.getItemsDataSet = function (options) {
        var _this = this;
        return this.dataStore.get(this.entity.endpoint + "/", options)
            .map(function (rawDataSet) {
            var rawItems = rawDataSet[_this.config.allItemsProperty];
            if (!rawItems)
                console.warn("Property '" + _this.config.allItemsProperty + "' wasn't found in DataSet for Entity '" + _this.entity.pluralName + "'.");
            return {
                count: rawDataSet.count,
                items: rawItems
            };
        })
            .flatMap(function (dataSet) {
            var itemCreators = dataSet.items.map(function (itemData) { return _this.createItem(itemData); });
            return Observable.Observable.combineLatest.apply(_this, itemCreators).map(function (items) {
                return Object.freeze({
                    count: dataSet.count,
                    items: items
                });
            });
        });
    };
    Repository.prototype.getItemById = function (itemId, allowCache) {
        var _this = this;
        if (allowCache === void 0) { allowCache = true; }
        if (allowCache !== false && this.entity.cache)
            return this.cache.get(itemId);
        if (this.entity.loadAll) {
            if (!this._allValues) {
                return this.getItemsDataSet()
                    .do(function (dataSet) {
                    _this._allValues = dataSet.items;
                    _this._allValuesMap = new Map();
                    _this._allValues.forEach(function (value) { return _this._allValuesMap.set(value.$key, value); });
                })
                    .map(function (dataSet) { return _this._allValuesMap.get(itemId); });
            }
            else
                return Observable.Observable.of(this._allValuesMap.get(itemId));
        }
        else {
            return this.dataStore.get(this.entity.endpoint + "/" + itemId)
                .flatMap(function (data) { return _this.createItem(data); });
        }
    };
    Repository.prototype.save = function (item) {
        var _this = this;
        var saveData = this.getItemSaveData(item);
        return this.dataStore.post(this.entity.endpoint + "/" + (item.$key || ''), saveData)
            .flatMap(function (savedItemData) { return _this.createItem(savedItemData); })
            .do(function (item) {
            if (_this._allValues) {
                _this._allValues = _this._allValues.concat([item]);
                _this._allItemsSubject$.next(_this._allValues);
            }
            _this._saveSubject$.next(item);
        });
    };
    Repository.prototype.getItemSaveData = function (item) {
        var modelData = {};
        for (var propertyId in item) {
            if (item.hasOwnProperty(propertyId)) {
                var modelValue = void 0;
                var propertyValue = item[propertyId], entityField = this.entity.fields.get(propertyId);
                if (entityField) {
                    var propertyRepository = this.repositoryManagerService.getRepository(entityField.type);
                    if (propertyRepository)
                        modelValue = propertyValue.$key;
                    else
                        modelValue = dataTransformers_service.DataTransformersService.serialize(entityField.type, propertyValue);
                    modelData[entityField.id] = modelValue;
                }
            }
        }
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

var dataStore_service = createCommonjsModule(function (module, exports) {
"use strict";
var __decorate = (commonjsGlobal && commonjsGlobal.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (commonjsGlobal && commonjsGlobal.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (commonjsGlobal && commonjsGlobal.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });


var DataStoreService = /** @class */ (function () {
    function DataStoreService(http$$1, config) {
        this.http = http$$1;
        this.config = config;
        this.activeRequests = new Map();
    }
    DataStoreService.prototype.get = function (endpoint, data) {
        return this.setActiveRequest(this.http.get(this.getEndpointUrl(endpoint), data), HttpVerb.get, endpoint, data);
    };
    DataStoreService.prototype.post = function (endpoint, data) {
        return this.http.post(this.getEndpointUrl(endpoint), data);
    };
    DataStoreService.prototype.getEndpointUrl = function (endpoint) {
        return this.config.apiRoot + "/" + endpoint;
    };
    DataStoreService.prototype.setActiveRequest = function (obs, verb, endpoint, data) {
        var _this = this;
        var activeRequestId = this.getActiveRequestId(verb, endpoint, data), existingActiveRequest = this.activeRequests.get(activeRequestId);
        if (existingActiveRequest)
            return existingActiveRequest;
        else {
            var warmObservable = obs.share();
            obs.finally(function () { return _this.activeRequests.delete(activeRequestId); });
            this.activeRequests.set(activeRequestId, warmObservable);
            return warmObservable;
        }
    };
    DataStoreService.prototype.getActiveRequestId = function (verb, endpoint, data) {
        return verb + "__" + endpoint + "__" + (data ? JSON.stringify(data) : '|');
    };
    DataStoreService = __decorate([
        core.Injectable(),
        __param(1, core.Inject('config')),
        __metadata("design:paramtypes", [http.HttpClient, Object])
    ], DataStoreService);
    return DataStoreService;
}());
exports.DataStoreService = DataStoreService;
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["get"] = "GET";
    HttpVerb["post"] = "POST";
})(HttpVerb || (HttpVerb = {}));
});

unwrapExports(dataStore_service);

var repositoryManager_service = createCommonjsModule(function (module, exports) {
"use strict";
var __decorate = (commonjsGlobal && commonjsGlobal.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (commonjsGlobal && commonjsGlobal.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (commonjsGlobal && commonjsGlobal.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });





var RepositoryManagerService = /** @class */ (function () {
    function RepositoryManagerService(dataStore, config) {
        this.dataStore = dataStore;
        this.config = config;
        this.repositories = new Map();
        this.save$ = new Subject.Subject();
    }
    RepositoryManagerService.prototype.getRepository = function (entityConstructor) {
        var _this = this;
        var repository$$1 = this.repositories.get(entityConstructor);
        if (!repository$$1) {
            var entityConfig = entities_service.entitiesService.getEntityByType(entityConstructor);
            if (!entityConfig)
                return null;
            repository$$1 = new repository.Repository(entityConfig, this.config, entityConstructor, this.dataStore, this);
            this.repositories.set(entityConstructor, repository$$1);
            repository$$1.save$.subscribe(function (savedItem) { return _this.save$.next({ repository: repository$$1, item: savedItem }); });
        }
        return repository$$1;
    };
    RepositoryManagerService = __decorate([
        core.Injectable(),
        __param(1, core.Inject('config')),
        __metadata("design:paramtypes", [dataStore_service.DataStoreService, Object])
    ], RepositoryManagerService);
    return RepositoryManagerService;
}());
exports.RepositoryManagerService = RepositoryManagerService;
});

unwrapExports(repositoryManager_service);

var entityConfig_base = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntityConfigBase = /** @class */ (function () {
    function EntityConfigBase(config) {
        Object.assign(this, config);
    }
    Object.defineProperty(EntityConfigBase.prototype, "fieldsArray", {
        get: function () {
            return this.fields ? Array.from(this.fields.values()) : [];
        },
        enumerable: true,
        configurable: true
    });
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
    function ModelEntity(config) {
        var _this = _super.call(this, config) || this;
        _this.loadAll = false;
        _this.endpoint = config.endpoint;
        _this.loadAll = config.loadAll === true;
        _this.cache = config.cache;
        return _this;
    }
    return ModelEntity;
}(entityConfig_base.EntityConfigBase));
exports.ModelEntity = ModelEntity;
});

unwrapExports(entity_config);

var immutability = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutability = /** @class */ (function () {
    function Immutability() {
    }
    Immutability.freeze = function (obj) {
        if (!Object.isFrozen(obj))
            Object.freeze(obj);
        if (Object(obj) === obj)
            Object.getOwnPropertyNames(obj).forEach(function (prop) { return Immutability.freeze(obj[prop]); });
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

var objectValue_config = createCommonjsModule(function (module, exports) {
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


var ModelObjectValue = /** @class */ (function (_super) {
    __extends(ModelObjectValue, _super);
    function ModelObjectValue(config) {
        var _this = _super.call(this, config) || this;
        if (config.values) {
            immutability.Immutability.freeze(_this.values);
        }
        return _this;
    }
    ModelObjectValue.prototype.getValueById = function (valueId) {
        var _this = this;
        if (!this.values)
            return null;
        if (!this._valuesMap) {
            this._valuesMap = new Map;
            this.values.forEach(function (value) { return _this._valuesMap.set(value.$key, value); });
        }
        return this._valuesMap ? this._valuesMap.get(valueId) : null;
    };
    return ModelObjectValue;
}(entityConfig_base.EntityConfigBase));
exports.ModelObjectValue = ModelObjectValue;
});

unwrapExports(objectValue_config);

var entityField_decorator = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function EntityField(fieldConfig) {
    return function (entityPrototype, propertyKey) {
        var propertyConstructor = window['Reflect'].getMetadata("design:type", entityPrototype, propertyKey);
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

var objectValue_decorator = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


function ObjectValue(config) {
    return function (target) {
        if (config.values)
            config.values = config.values.map(function (valueConfig) { return new target.prototype.constructor(valueConfig); });
        var objectValueConfig = new objectValue_config.ModelObjectValue(config);
        target.objectValueConfig = objectValueConfig;
        objectValues_service.objectValuesService.addEntity(target, objectValueConfig);
    };
}
exports.ObjectValue = ObjectValue;
});

unwrapExports(objectValue_decorator);

var entity_decorator = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


function Entity(config) {
    return function (target) {
        var entity = new entity_config.ModelEntity(config);
        target.entityConfig = entity;
        entities_service.entitiesService.addEntity(target, entity);
    };
}
exports.Entity = Entity;
});

unwrapExports(entity_decorator);

var operators = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// rxjs
});

unwrapExports(operators);

var parisConfig = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = {
    allItemsProperty: "items",
    entityIdProperty: "$key"
};
});

unwrapExports(parisConfig);

var paris_module = createCommonjsModule(function (module, exports) {
"use strict";
var __decorate = (commonjsGlobal && commonjsGlobal.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });






var ParisModule = /** @class */ (function () {
    function ParisModule() {
    }
    ParisModule_1 = ParisModule;
    ParisModule.forRoot = function (config) {
        return {
            ngModule: ParisModule_1,
            providers: [
                repositoryManager_service.RepositoryManagerService,
                { provide: 'config', useValue: Object.assign({}, parisConfig.defaultConfig, config) }
            ]
        };
    };
    ParisModule = ParisModule_1 = __decorate([
        core.NgModule({
            imports: [http.HttpClientModule],
            providers: [
                repositoryManager_service.RepositoryManagerService,
                dataStore_service.DataStoreService
            ]
        })
    ], ParisModule);
    return ParisModule;
    var ParisModule_1;
}());
exports.ParisModule = ParisModule;
});

unwrapExports(paris_module);

var main = createCommonjsModule(function (module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

exports.Repository = repository.Repository;

exports.RepositoryManagerService = repositoryManager_service.RepositoryManagerService;

exports.DataTransformersService = dataTransformers_service.DataTransformersService;

exports.ModelEntity = entity_config.ModelEntity;

exports.entityFieldsService = entityFields_service.entityFieldsService;

exports.entitiesService = entities_service.entitiesService;

exports.ModelObjectValue = objectValue_config.ModelObjectValue;

exports.EntityField = entityField_decorator.EntityField;

exports.ObjectValue = objectValue_decorator.ObjectValue;

exports.Entity = entity_decorator.Entity;

exports.ParisModule = paris_module.ParisModule;
});

var main$1 = unwrapExports(main);
var main_1 = main.Repository;
var main_2 = main.RepositoryManagerService;
var main_3 = main.DataTransformersService;
var main_4 = main.ModelEntity;
var main_5 = main.entityFieldsService;
var main_6 = main.entitiesService;
var main_7 = main.ModelObjectValue;
var main_8 = main.EntityField;
var main_9 = main.ObjectValue;
var main_10 = main.Entity;
var main_11 = main.ParisModule;

exports['default'] = main$1;
exports.Repository = main_1;
exports.RepositoryManagerService = main_2;
exports.DataTransformersService = main_3;
exports.ModelEntity = main_4;
exports.entityFieldsService = main_5;
exports.entitiesService = main_6;
exports.ModelObjectValue = main_7;
exports.EntityField = main_8;
exports.ObjectValue = main_9;
exports.Entity = main_10;
exports.ParisModule = main_11;

Object.defineProperty(exports, '__esModule', { value: true });

})));
