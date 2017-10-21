"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entity_fields_service_1 = require("../services/entity-fields.service");
function EntityField(fieldConfig) {
    return function (entityPrototype, propertyKey) {
        var propertyConstructor = window['Reflect'].getMetadata("design:type", entityPrototype, propertyKey);
        var fieldConfigCopy = Object.assign({}, fieldConfig);
        if (!fieldConfigCopy.id)
            fieldConfigCopy.id = String(propertyKey);
        fieldConfigCopy.type = fieldConfig.arrayOf || propertyConstructor;
        fieldConfigCopy.isArray = propertyConstructor === Array;
        entity_fields_service_1.entityFieldsService.addField(entityPrototype, fieldConfigCopy);
    };
}
exports.EntityField = EntityField;
