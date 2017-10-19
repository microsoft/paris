"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_value_config_1 = require("./object-value.config");
var object_values_service_1 = require("../services/object-values.service");
function ObjectValue(config) {
    return function (target) {
        if (config.values)
            config.values = config.values.map(function (valueConfig) { return new target.prototype.constructor(valueConfig); });
        var objectValueConfig = new object_value_config_1.ModelObjectValue(config);
        target.objectValueConfig = objectValueConfig;
        object_values_service_1.objectValuesService.addEntity(target, objectValueConfig);
    };
}
exports.ObjectValue = ObjectValue;
