"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
var data_transformers_service_1 = require("../services/data-transformers.service");
var cache_1 = require("../services/cache");
var object_values_service_1 = require("../services/object-values.service");
var Repository = (function () {
    function Repository(entity, config, entityConstructor, dataStore, repositoryManagerService) {
        this.entity = entity;
        this.config = config;
        this.entityConstructor = entityConstructor;
        this.dataStore = dataStore;
        this.repositoryManagerService = repositoryManagerService;
        var getAllItems$ = this.getItemsDataSet().map(function (dataSet) { return dataSet.items; });
        this._allItemsSubject$ = new Subject_1.Subject();
        this._allItems$ = Observable_1.Observable.merge(getAllItems$, this._allItemsSubject$.asObservable());
        this._saveSubject$ = new Subject_1.Subject();
        this.save$ = this._saveSubject$.asObservable();
    }
    Object.defineProperty(Repository.prototype, "allItems$", {
        get: function () {
            if (this._allValues)
                return Observable_1.Observable.merge(Observable_1.Observable.of(this._allValues), this._allItemsSubject$.asObservable());
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
                this._cache = new cache_1.DataCache(cacheSettings);
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
                        getPropertyEntityValue$ = Observable_1.Observable.combineLatest.apply(_this, propertyMembers$).map(mapValueToEntityFieldIndex);
                    }
                    else {
                        getPropertyEntityValue$ = _this.getEntityItem(propertyRepository_1, propertyValue).map(mapValueToEntityFieldIndex);
                    }
                    subModels.push(getPropertyEntityValue$);
                }
                else {
                    var objectValueType = object_values_service_1.objectValuesService.getEntityByType(entityField.type);
                    if (objectValueType)
                        modelData[entityField.id] = objectValueType.getValueById(propertyValue) || propertyValue;
                    else {
                        modelData[entityField.id] = entityField.isArray
                            ? propertyValue ? propertyValue.map(function (elementValue) { return data_transformers_service_1.DataTransformersService.parse(entityField.type, elementValue); }) : []
                            : data_transformers_service_1.DataTransformersService.parse(entityField.type, propertyValue);
                    }
                }
            }
        });
        if (subModels.length) {
            return Observable_1.Observable.combineLatest.apply(this, subModels).map(function (propertyEntityValues) {
                propertyEntityValues.forEach(function (propertyEntityValue) { return Object.assign(modelData, propertyEntityValue); });
                return new _this.entityConstructor(modelData);
            });
        }
        else
            return Observable_1.Observable.of(modelData);
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
            return Observable_1.Observable.combineLatest.apply(_this, itemCreators).map(function (items) {
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
                return Observable_1.Observable.of(this._allValuesMap.get(itemId));
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
                        modelValue = data_transformers_service_1.DataTransformersService.serialize(entityField.type, propertyValue);
                    modelData[entityField.id] = modelValue;
                }
            }
        }
        return modelData;
    };
    return Repository;
}());
exports.Repository = Repository;
