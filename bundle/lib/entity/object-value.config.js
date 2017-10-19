"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var entity_config_base_1 = require("./entity-config.base");
var immutability_1 = require("../services/immutability");
var ModelObjectValue = (function (_super) {
    __extends(ModelObjectValue, _super);
    function ModelObjectValue(config) {
        var _this = _super.call(this, config) || this;
        if (config.values) {
            immutability_1.Immutability.freeze(_this.values);
        }
        return _this;
    }
    ModelObjectValue.prototype.getValueById = function (valueId) {
        var _this = this;
        if (!this.values)
            return null;
        if (!this._valuesMap) {
            this._valuesMap = new Map;
            this.values.forEach(function (value) { return _this._valuesMap.set(value.$key, value); });
        }
        return this._valuesMap ? this._valuesMap.get(valueId) : null;
    };
    return ModelObjectValue;
}(entity_config_base_1.EntityConfigBase));
exports.ModelObjectValue = ModelObjectValue;
