"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorsService = /** @class */ (function () {
    function ErrorsService() {
    }
    ErrorsService.warn = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return console && console.warn.apply(console, ["Paris warning: "].concat(items, [new Error().stack]));
    };
    return ErrorsService;
}());
exports.ErrorsService = ErrorsService;
