"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paris_config_1 = require("../config/paris-config");
var repository_1 = require("../repository/repository");
var entities_service_1 = require("./entities.service");
var data_store_service_1 = require("./data-store.service");
var Subject_1 = require("rxjs/Subject");
var Paris = /** @class */ (function () {
    function Paris(config) {
        this.repositories = new Map();
        this._saveSubject$ = new Subject_1.Subject;
        this._removeSubject$ = new Subject_1.Subject;
        this.config = Object.assign({}, paris_config_1.defaultConfig, config);
        this.dataStore = new data_store_service_1.DataStoreService(this.config);
        this.save$ = this._saveSubject$.asObservable();
        this.remove$ = this._removeSubject$.asObservable();
    }
    Paris.prototype.getRepository = function (entityConstructor) {
        var _this = this;
        var repository = this.repositories.get(entityConstructor);
        if (!repository) {
            var entityConfig = entities_service_1.entitiesService.getEntityByType(entityConstructor);
            if (!entityConfig)
                return null;
            repository = new repository_1.Repository(entityConfig, this.config, entityConstructor, this.dataStore, this);
            this.repositories.set(entityConstructor, repository);
            // If the entity has an endpoint, it means it connects to the backend, so subscribe to save/delete events to enable global events:
            if (entityConfig.endpoint) {
                repository.save$.subscribe(function (saveEvent) { return _this._saveSubject$.next(saveEvent); });
                repository.remove$.subscribe(function (removeEvent) { return _this._removeSubject$.next(removeEvent); });
            }
        }
        return repository;
    };
    Paris.prototype.getModelBaseConfig = function (entityConstructor) {
        return entityConstructor.entityConfig || entityConstructor.valueObjectConfig;
    };
    return Paris;
}());
exports.Paris = Paris;
