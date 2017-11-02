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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var model_base_1 = require("./model.base");
var entity_field_decorator_1 = require("../entity/entity-field.decorator");
var EntityModelBase = /** @class */ (function (_super) {
    __extends(EntityModelBase, _super);
    function EntityModelBase(data) {
        return _super.call(this, data) || this;
    }
    Object.defineProperty(EntityModelBase.prototype, "isNew", {
        get: function () {
            return this.id === null || this.id === undefined;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        entity_field_decorator_1.EntityField(),
        __metadata("design:type", Object)
    ], EntityModelBase.prototype, "id", void 0);
    return EntityModelBase;
}(model_base_1.ModelBase));
exports.EntityModelBase = EntityModelBase;
