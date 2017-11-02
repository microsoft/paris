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
var entities_service_base_1 = require("./entities.service.base");
var ValueObjectsService = /** @class */ (function (_super) {
    __extends(ValueObjectsService, _super);
    function ValueObjectsService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ValueObjectsService;
}(entities_service_base_1.EntitiesServiceBase));
exports.ValueObjectsService = ValueObjectsService;
exports.valueObjectsService = new ValueObjectsService;
