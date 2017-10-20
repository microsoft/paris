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
