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
