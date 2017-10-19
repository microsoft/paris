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
var http_1 = require("@angular/common/http");
var DataStoreService = (function () {
    function DataStoreService(http, config) {
        this.http = http;
        this.config = config;
        this.activeRequests = new Map();
    }
    DataStoreService.prototype.get = function (endpoint, data) {
        return this.setActiveRequest(this.http.get(this.getEndpointUrl(endpoint), data), HttpVerb.get, endpoint, data);
    };
    DataStoreService.prototype.post = function (endpoint, data) {
        return this.http.post(this.getEndpointUrl(endpoint), data);
    };
    DataStoreService.prototype.getEndpointUrl = function (endpoint) {
        return this.config.apiRoot + "/" + endpoint;
    };
    DataStoreService.prototype.setActiveRequest = function (obs, verb, endpoint, data) {
        var _this = this;
        var activeRequestId = this.getActiveRequestId(verb, endpoint, data), existingActiveRequest = this.activeRequests.get(activeRequestId);
        if (existingActiveRequest)
            return existingActiveRequest;
        else {
            var warmObservable = obs.share();
            obs.finally(function () { return _this.activeRequests.delete(activeRequestId); });
            this.activeRequests.set(activeRequestId, warmObservable);
            return warmObservable;
        }
    };
    DataStoreService.prototype.getActiveRequestId = function (verb, endpoint, data) {
        return verb + "__" + endpoint + "__" + (data ? JSON.stringify(data) : '|');
    };
    DataStoreService = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Inject('config')),
        __metadata("design:paramtypes", [http_1.HttpClient, Object])
    ], DataStoreService);
    return DataStoreService;
}());
exports.DataStoreService = DataStoreService;
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["get"] = "GET";
    HttpVerb["post"] = "POST";
})(HttpVerb || (HttpVerb = {}));
