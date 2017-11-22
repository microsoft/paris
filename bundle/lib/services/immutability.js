"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Immutability = /** @class */ (function () {
    function Immutability() {
    }
    /**
     * Deep-freezes an object
     * @param {T} obj The object to freeze
     * @param {Set<any>} excluded For internal use, used to avoid infinite recursion, when a parent object is references in one of its children
     * @returns {Readonly<T>}
     */
    Immutability.freeze = function (obj, excluded) {
        if (excluded && excluded.has(obj))
            return obj;
        if (!Object.isFrozen(obj))
            Object.freeze(obj);
        if (Object(obj) === "object") {
            var childrenExcluded_1 = excluded ? new Set(excluded) : new Set;
            Object.getOwnPropertyNames(obj).forEach(function (prop) { return Immutability.freeze(obj[prop], childrenExcluded_1); });
        }
        return obj;
    };
    Immutability.unfreeze = function (obj) {
        if (Object(obj) !== obj || obj instanceof Date || obj instanceof RegExp || obj instanceof Function)
            return obj;
        var unfrozenObj = Object.create(obj.constructor.prototype);
        Object.assign(unfrozenObj, obj);
        Object.getOwnPropertyNames(obj).forEach(function (prop) {
            unfrozenObj[prop] = Immutability.unfreeze(unfrozenObj[prop]);
        });
        return unfrozenObj;
    };
    return Immutability;
}());
exports.Immutability = Immutability;
