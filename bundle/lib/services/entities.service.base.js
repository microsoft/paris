"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entity_fields_service_1 = require("./entity-fields.service");
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
        var dataEntityTypeFields = dataEntity && dataEntity.fields || entity_fields_service_1.entityFieldsService.getDataTypeFields(dataEntityType);
        if (dataEntityTypeFields)
            dataEntityTypeFields.forEach(function (field, fieldId) { return fullDataEntityTypeFields.set(fieldId, field); });
        return fullDataEntityTypeFields;
    };
    return EntitiesServiceBase;
}());
exports.EntitiesServiceBase = EntitiesServiceBase;
