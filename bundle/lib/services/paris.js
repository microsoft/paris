"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paris_config_1 = require("../config/paris-config");
var repository_1 = require("../repository/repository");
var entities_service_1 = require("./entities.service");
var data_store_service_1 = require("./data-store.service");
var Paris = /** @class */ (function () {
    function Paris(config) {
        this.repositories = new Map();
        this.config = Object.assign({}, paris_config_1.defaultConfig, config);
        this.dataStore = new data_store_service_1.DataStoreService(this.config);
    }
    Paris.prototype.getRepository = function (entityConstructor) {
        var repository = this.repositories.get(entityConstructor);
        if (!repository) {
            var entityConfig = entities_service_1.entitiesService.getEntityByType(entityConstructor);
            if (!entityConfig)
                return null;
            repository = new repository_1.Repository(entityConfig, this.config, entityConstructor, this.dataStore, this);
            this.repositories.set(entityConstructor, repository);
        }
        return repository;
    };
    return Paris;
}());
exports.Paris = Paris;
