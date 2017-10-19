"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transformers = [
    {
        type: Date,
        parse: function (dateValue) { return new Date(dateValue); },
        serialize: function (date) { return date.valueOf(); }
    }
];
var transformersMap = new Map;
transformers.forEach(function (transformer) { return transformersMap.set(transformer.type, transformer); });
var DataTransformersService = (function () {
    function DataTransformersService() {
    }
    DataTransformersService.parse = function (type, value) {
        var transformer = transformersMap.get(type);
        return transformer ? transformer.parse(value) : value;
    };
    DataTransformersService.serialize = function (type, value) {
        var transformer = transformersMap.get(type);
        return transformer ? transformer.serialize(value) : value;
    };
    return DataTransformersService;
}());
exports.DataTransformersService = DataTransformersService;
