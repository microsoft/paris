"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transformers = [
    {
        type: Date,
        parse: function (dateValue) { return new Date(dateValue); },
        serialize: function (date) { return date ? date.valueOf() : null; }
    },
    {
        type: RegExp,
        parse: function (pattern) { return new RegExp(pattern); },
        serialize: function (regExp) { return regExp ? regExp.toString().match(/^\/(.*)\/$/)[1] : null; }
    }
];
var transformersMap = new Map;
transformers.forEach(function (transformer) { return transformersMap.set(transformer.type, transformer); });
var DataTransformersService = /** @class */ (function () {
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
