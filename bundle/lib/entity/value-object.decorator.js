"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_objects_service_1 = require("../services/value-objects.service");
var entity_config_base_1 = require("./entity-config.base");
function ValueObject(config) {
    return function (target) {
        var valueObjectConfig = new entity_config_base_1.EntityConfigBase(config, target.prototype.constructor);
        target.valueObjectConfig = valueObjectConfig;
        value_objects_service_1.valueObjectsService.addEntity(target, valueObjectConfig);
    };
}
exports.ValueObject = ValueObject;
