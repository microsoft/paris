"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var repository_1 = require("../repository/repository");
var Subject_1 = require("rxjs/Subject");
var entities_service_1 = require("./entities.service");
var data_store_service_1 = require("./data-store/data-store.service");
var RepositoryManagerService = /** @class */ (function () {
    function RepositoryManagerService(dataStore, config) {
        this.dataStore = dataStore;
        this.config = config;
        this.repositories = new Map();
        this.save$ = new Subject_1.Subject();
    }
    RepositoryManagerService.prototype.getRepository = function (entityConstructor) {
        var _this = this;
        var repository = this.repositories.get(entityConstructor);
        if (!repository) {
            var entityConfig = entities_service_1.entitiesService.getEntityByType(entityConstructor);
            if (!entityConfig)
                return null;
            repository = new repository_1.Repository(entityConfig, this.config, entityConstructor, this.dataStore, this);
            this.repositories.set(entityConstructor, repository);
            repository.save$.subscribe(function (savedItem) { return _this.save$.next({ repository: repository, item: savedItem }); });
        }
        return repository;
    };
    RepositoryManagerService = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Inject('config')),
        __metadata("design:paramtypes", [data_store_service_1.DataStoreService, Object])
    ], RepositoryManagerService);
    return RepositoryManagerService;
}());
exports.RepositoryManagerService = RepositoryManagerService;
