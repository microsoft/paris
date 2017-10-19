"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("operators");
var core_1 = require("@angular/core");
var repository_manager_service_1 = require("./repository/repository-manager.service");
var http_1 = require("@angular/common/http");
var data_store_service_1 = require("./services/data-store/data-store.service");
var paris_config_1 = require("./config/paris-config");
var ParisModule = (function () {
    function ParisModule() {
    }
    ParisModule_1 = ParisModule;
    ParisModule.forRoot = function (config) {
        return {
            ngModule: ParisModule_1,
            providers: [
                repository_manager_service_1.RepositoryManagerService,
                { provide: 'config', useValue: Object.assign({}, paris_config_1.defaultConfig, config) }
            ]
        };
    };
    ParisModule = ParisModule_1 = __decorate([
        core_1.NgModule({
            imports: [http_1.HttpClientModule],
            providers: [
                repository_manager_service_1.RepositoryManagerService,
                data_store_service_1.DataStoreService
            ]
        })
    ], ParisModule);
    return ParisModule;
    var ParisModule_1;
}());
exports.ParisModule = ParisModule;
