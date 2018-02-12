"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entity_model_base_1 = require("../models/entity-model.base");
var dataset_service_1 = require("../services/dataset.service");
var errors_service_1 = require("../services/errors.service");
var data_options_1 = require("../dataset/data.options");
var Observable_1 = require("rxjs/Observable");
var entity_config_1 = require("../entity/entity.config");
var data_availability_enum_1 = require("../dataset/data-availability.enum");
var entity_field_1 = require("../entity/entity-field");
var cache_1 = require("../services/cache");
var data_transformers_service_1 = require("../services/data-transformers.service");
var _ = require("lodash");
var value_objects_service_1 = require("../services/value-objects.service");
var ReadonlyRepository = /** @class */ (function () {
    function ReadonlyRepository(entity, entityBackendConfig, config, entityConstructor, dataStore, paris) {
        this.entity = entity;
        this.entityBackendConfig = entityBackendConfig;
        this.config = config;
        this.entityConstructor = entityConstructor;
        this.dataStore = dataStore;
        this.paris = paris;
    }
    Object.defineProperty(ReadonlyRepository.prototype, "baseUrl", {
        get: function () {
            if (!this.entityBackendConfig.baseUrl)
                return null;
            return this.entityBackendConfig.baseUrl instanceof Function ? this.entityBackendConfig.baseUrl(this.config) : this.entityBackendConfig.baseUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReadonlyRepository.prototype, "allItems$", {
        get: function () {
            if (this._allValues)
                return Observable_1.Observable.merge(Observable_1.Observable.of(this._allValues), this._allItemsSubject$.asObservable());
            if (this.entityBackendConfig.loadAll)
                return this.setAllItems();
            return this._allItems$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReadonlyRepository.prototype, "cache", {
        get: function () {
            var _this = this;
            if (!this._cache) {
                var cacheSettings = Object.assign({
                    getter: function (itemId, params) { return _this.getItemById(itemId, { allowCache: false }, params); }
                }, this.entityBackendConfig.cache);
                this._cache = new cache_1.DataCache(cacheSettings);
            }
            return this._cache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReadonlyRepository.prototype, "endpointName", {
        get: function () {
            return this.entityBackendConfig.endpoint instanceof Function ? this.entityBackendConfig.endpoint(this.config) : this.entityBackendConfig.endpoint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReadonlyRepository.prototype, "endpointUrl", {
        get: function () {
            return this.baseUrl + "/" + this.endpointName;
        },
        enumerable: true,
        configurable: true
    });
    ReadonlyRepository.prototype.setAllItems = function () {
        var _this = this;
        if (this._allValues)
            return Observable_1.Observable.of(this._allValues);
        return this.query().do(function (dataSet) {
            _this._allValues = dataSet.items;
            _this._allValuesMap = new Map();
            _this._allValues.forEach(function (value) { return _this._allValuesMap.set(String(value instanceof entity_model_base_1.EntityModelBase ? value.id : value.toString()), value); });
        }).map(function (dataSet) { return dataSet.items; });
    };
    ReadonlyRepository.prototype.createNewItem = function () {
        var defaultData = {};
        this.entity.fieldsArray.forEach(function (field) {
            if (field.defaultValue !== undefined)
                defaultData[field.id] = field.defaultValue;
            else if (field.isArray)
                defaultData[field.id] = [];
        });
        return new this.entityConstructor(defaultData);
    };
    ReadonlyRepository.prototype.createItem = function (itemData, options, query) {
        if (options === void 0) { options = { allowCache: true, availability: data_availability_enum_1.DataAvailability.available }; }
        return ReadonlyRepository.getModelData(itemData, this.entity, this.config, this.paris, options, query);
    };
    ReadonlyRepository.prototype.query = function (query, dataOptions) {
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        return this.paris.callQuery(this.entityConstructor, this.entityBackendConfig, query, dataOptions);
    };
    ReadonlyRepository.prototype.queryItem = function (query, dataOptions) {
        var _this = this;
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        var httpOptions = this.entityBackendConfig.parseDataQuery ? { params: this.entityBackendConfig.parseDataQuery(query) } : dataset_service_1.DatasetService.queryToHttpOptions(query);
        if (this.entityBackendConfig.fixedData) {
            if (!httpOptions)
                httpOptions = {};
            if (!httpOptions.params)
                httpOptions.params = {};
            Object.assign(httpOptions.params, this.entityBackendConfig.fixedData);
        }
        var endpoint;
        if (this.entityBackendConfig.endpoint instanceof Function)
            endpoint = this.entityBackendConfig.endpoint(this.config, query);
        else
            endpoint = "" + this.endpointName + (this.entityBackendConfig.allItemsEndpointTrailingSlash !== false && !this.entityBackendConfig.allItemsEndpoint ? '/' : '') + (this.entityBackendConfig.allItemsEndpoint || '');
        return this.dataStore.get(endpoint, httpOptions, this.baseUrl)
            .flatMap(function (data) { return _this.createItem(data, dataOptions, query); });
    };
    ReadonlyRepository.prototype.getItemById = function (itemId, options, params) {
        var _this = this;
        if (options === void 0) { options = data_options_1.defaultDataOptions; }
        var idFieldIndex = _.findIndex(this.entity.fieldsArray, function (field) { return field.id === "id"; });
        if (~idFieldIndex) {
            var idField = this.entity.fieldsArray[idFieldIndex];
            if (idField.type === Number && typeof (itemId) === "string") {
                var originalItemId = itemId;
                itemId = parseInt(itemId, 10);
                if (isNaN(itemId))
                    throw new Error("Invalid ID for " + this.entity.singularName + ". Expected a number but got: " + originalItemId + ".");
            }
        }
        if (this.entity.values) {
            var entityValue = void 0;
            if (itemId !== null && itemId !== undefined) {
                if (this.entity.hasValue(itemId))
                    entityValue = this.entity.getValueById(itemId);
                else
                    errors_service_1.ErrorsService.warn("Unknown value for " + this.entity.singularName + ": ", itemId);
            }
            return Observable_1.Observable.of(entityValue || this.entity.getDefaultValue());
        }
        if (options.allowCache !== false && this.entityBackendConfig.cache)
            return this.cache.get(itemId, params);
        if (this.entityBackendConfig.loadAll)
            return this.setAllItems().map(function () { return _this._allValuesMap.get(String(itemId)); });
        else {
            return this.dataStore.get(this.entityBackendConfig.parseItemQuery ? this.entityBackendConfig.parseItemQuery(itemId, this.entity, this.config, params) : this.endpointName + "/" + itemId, params && { params: params }, this.baseUrl)
                .flatMap(function (data) { return _this.createItem(data, options, { where: Object.assign({ itemId: itemId }, params) }); });
        }
    };
    /**
     * Creates a JSON object that can be saved to server, with the reverse logic of getItemModelData
     * @param {T} item
     * @returns {Index}
     */
    ReadonlyRepository.prototype.serializeItem = function (item) {
        ReadonlyRepository.validateItem(item, this.entity);
        return ReadonlyRepository.serializeItem(item, this.entity, this.paris);
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
    ReadonlyRepository.getModelData = function (rawData, entity, config, paris, options, query) {
        if (options === void 0) { options = data_options_1.defaultDataOptions; }
        var entityIdProperty = entity.idProperty || config.entityIdProperty, modelData = entity instanceof entity_config_1.ModelEntity ? { id: rawData[entityIdProperty] } : {}, subModels = [];
        var getModelDataError = new Error("Failed to create " + entity.singularName + ".");
        entity.fields.forEach(function (entityField) {
            if (entityField.require) {
                var failed = false;
                if (entityField.require instanceof Function && !entityField.require(rawData, paris.config))
                    failed = true;
                else if (typeof (entityField.require) === "string") {
                    var rawDataPropertyValue = rawData[entityField.require];
                    if (rawDataPropertyValue === undefined || rawDataPropertyValue === null)
                        failed = true;
                }
                if (failed) {
                    modelData[entityField.id] = null;
                    return;
                }
            }
            var propertyValue;
            if (entityField.data) {
                if (entityField.data instanceof Array) {
                    for (var i = 0, path = void 0; i < entityField.data.length && propertyValue === undefined; i++) {
                        path = entityField.data[i];
                        var value = path === entity_field_1.FIELD_DATA_SELF ? rawData : _.get(rawData, path);
                        if (value !== undefined && value !== null)
                            propertyValue = value;
                    }
                }
                else
                    propertyValue = entityField.data === entity_field_1.FIELD_DATA_SELF ? rawData : _.get(rawData, entityField.data);
            }
            else
                propertyValue = rawData[entityField.id];
            if (entityField.parse) {
                try {
                    propertyValue = entityField.parse(propertyValue, rawData, query);
                }
                catch (e) {
                    getModelDataError.message = getModelDataError.message + (" Error parsing field " + entityField.id + ": ") + e.message;
                    throw getModelDataError;
                }
            }
            if (propertyValue === undefined || propertyValue === null) {
                var fieldRepository = paris.getRepository(entityField.type);
                var fieldValueObjectType = !fieldRepository && value_objects_service_1.valueObjectsService.getEntityByType(entityField.type);
                var defaultValue = fieldRepository && fieldRepository.entity.getDefaultValue()
                    || fieldValueObjectType && fieldValueObjectType.getDefaultValue()
                    || (entityField.isArray ? [] : entityField.defaultValue !== undefined && entityField.defaultValue !== null ? entityField.defaultValue : null);
                if ((defaultValue === undefined || defaultValue === null) && entityField.required) {
                    getModelDataError.message = getModelDataError.message + (" Field " + entityField.id + " is required but it's " + propertyValue + ".");
                    throw getModelDataError;
                }
                modelData[entityField.id] = defaultValue;
            }
            else {
                var getPropertyEntityValue$ = ReadonlyRepository.getSubModel(entityField, propertyValue, paris, config, options);
                if (getPropertyEntityValue$)
                    subModels.push(getPropertyEntityValue$);
                else {
                    modelData[entityField.id] = entityField.isArray
                        ? propertyValue
                            ? propertyValue.map(function (elementValue) { return data_transformers_service_1.DataTransformersService.parse(entityField.type, elementValue); })
                            : []
                        : data_transformers_service_1.DataTransformersService.parse(entityField.type, propertyValue);
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
    ReadonlyRepository.getSubModel = function (entityField, value, paris, config, options) {
        if (options === void 0) { options = data_options_1.defaultDataOptions; }
        var getPropertyEntityValue$;
        var mapValueToEntityFieldIndex = ReadonlyRepository.mapToEntityFieldIndex.bind(null, entityField.id);
        var repository = paris.getRepository(entityField.type);
        var valueObjectType = !repository && value_objects_service_1.valueObjectsService.getEntityByType(entityField.type);
        if (!repository && !valueObjectType)
            return null;
        var getItem = repository
            ? ReadonlyRepository.getEntityItem.bind(null, repository)
            : ReadonlyRepository.getValueObjectItem.bind(null, valueObjectType);
        if (entityField.isArray) {
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
    ReadonlyRepository.mapToEntityFieldIndex = function (entityFieldId, value) {
        var data = {};
        data[entityFieldId] = value;
        return data;
    };
    ReadonlyRepository.getEntityItem = function (repository, data, options) {
        if (options === void 0) { options = data_options_1.defaultDataOptions; }
        return Object(data) === data ? repository.createItem(data, options) : repository.getItemById(data, options);
    };
    ReadonlyRepository.getValueObjectItem = function (valueObjectType, data, options, paris, config) {
        if (options === void 0) { options = data_options_1.defaultDataOptions; }
        // If the value object is one of a list of values, just set it to the model
        if (valueObjectType.values)
            return Observable_1.Observable.of(valueObjectType.getValueById(data) || valueObjectType.getDefaultValue() || null);
        return ReadonlyRepository.getModelData(data, valueObjectType, config, paris, options);
    };
    /**
     * Validates that the specified item is valid, according to the requirements of the entity (or value object) it belongs to.
     * @param item
     * @param {EntityConfigBase} entity
     * @returns {boolean}
     */
    ReadonlyRepository.validateItem = function (item, entity) {
        entity.fields.forEach(function (entityField) {
            var itemFieldValue = item[entityField.id];
            if (entityField.required && (itemFieldValue === undefined || itemFieldValue === null))
                throw new Error("Missing value for field '" + entityField.id + "'");
        });
        return true;
    };
    /**
     * Serializes an object value
     * @param item
     * @returns {Index}
     */
    ReadonlyRepository.serializeItem = function (item, entity, paris) {
        ReadonlyRepository.validateItem(item, entity);
        var modelData = {};
        entity.fields.forEach(function (entityField) {
            var itemFieldValue = item[entityField.id], fieldRepository = paris.getRepository(entityField.type), fieldValueObjectType = !fieldRepository && value_objects_service_1.valueObjectsService.getEntityByType(entityField.type), isNilValue = itemFieldValue === undefined || itemFieldValue === null;
            var modelValue;
            if (entityField.serialize)
                modelValue = entityField.serialize(itemFieldValue);
            else if (entityField.isArray)
                modelValue = itemFieldValue ? itemFieldValue.map(function (element) { return ReadonlyRepository.serializeItem(element, fieldRepository ? fieldRepository.entity : fieldValueObjectType, paris); }) : null;
            else if (fieldRepository)
                modelValue = isNilValue ? fieldRepository.entity.getDefaultValue() || null : itemFieldValue.id;
            else if (fieldValueObjectType)
                modelValue = isNilValue ? fieldValueObjectType.getDefaultValue() || null : ReadonlyRepository.serializeItem(itemFieldValue, fieldValueObjectType, paris);
            else
                modelValue = data_transformers_service_1.DataTransformersService.serialize(entityField.type, itemFieldValue);
            var modelProperty = entityField.data
                ? entityField.data instanceof Array ? entityField.data[0] : entityField.data
                : entityField.id;
            modelData[modelProperty] = modelValue;
        });
        if (entity.serializeItem)
            modelData = entity.serializeItem(item, modelData, entity, paris.config);
        return modelData;
    };
    return ReadonlyRepository;
}());
exports.ReadonlyRepository = ReadonlyRepository;
