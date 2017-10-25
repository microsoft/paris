"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entity_config_1 = require("./entity.config");
var entities_service_1 = require("../services/entities.service");
function Entity(config) {
    return function (target) {
        var entity = new entity_config_1.ModelEntity(config, target.prototype.constructor);
        target.entityConfig = entity;
        entities_service_1.entitiesService.addEntity(target, entity);
    };
}
exports.Entity = Entity;
