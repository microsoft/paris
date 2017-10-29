"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutability_1 = require("../services/immutability");
var EntityConfigBase = /** @class */ (function () {
    function EntityConfigBase(config, entityConstructor) {
        this.entityConstructor = entityConstructor;
        this.readonly = false;
        if (config.values) {
            config.values = config.values.map(function (valueConfig) { return new entityConstructor(valueConfig); });
            immutability_1.Immutability.freeze(config.values);
        }
        Object.assign(this, config);
    }
    Object.defineProperty(EntityConfigBase.prototype, "fieldsArray", {
        get: function () {
            return this.fields ? Array.from(this.fields.values()) : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityConfigBase.prototype, "valuesMap", {
        get: function () {
            var _this = this;
            if (this._valuesMap === undefined) {
                if (!this.values)
                    this._valuesMap = null;
                else {
                    this._valuesMap = new Map;
                    this.values.forEach(function (value) { return _this._valuesMap.set(value.id, Object.freeze(value)); });
                }
            }
            return this._valuesMap;
        },
        enumerable: true,
        configurable: true
    });
    EntityConfigBase.prototype.getValueById = function (valueId) {
        return this.valuesMap ? this.valuesMap.get(valueId) : null;
    };
    EntityConfigBase.prototype.hasValue = function (valueId) {
        return this.valuesMap ? this.valuesMap.has(valueId) : false;
    };
    return EntityConfigBase;
}());
exports.EntityConfigBase = EntityConfigBase;
