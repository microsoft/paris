"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_service_1 = require("./http.service");
var Observable_1 = require("rxjs/Observable");
var DataStoreService = /** @class */ (function () {
    function DataStoreService(config) {
        this.config = config;
        this.activeRequests = new Map();
    }
    DataStoreService.prototype.get = function (endpoint, data, baseUrl) {
        return this.setActiveRequest(Observable_1.Observable.from(http_service_1.Http.get(this.getEndpointUrl(endpoint, baseUrl), data, this.config.http)), "GET", endpoint, data);
    };
    DataStoreService.prototype.save = function (endpoint, method, data, baseUrl) {
        if (method === void 0) { method = "POST"; }
        return http_service_1.Http.request(method, this.getEndpointUrl(endpoint, baseUrl), data, this.config.http);
    };
    DataStoreService.prototype.delete = function (endpoint, data, baseUrl) {
        return http_service_1.Http.request("DELETE", this.getEndpointUrl(endpoint, baseUrl), data, this.config.http);
    };
    DataStoreService.prototype.getEndpointUrl = function (endpoint, baseUrl) {
        return (baseUrl || this.config.apiRoot || "") + "/" + endpoint;
    };
    DataStoreService.prototype.setActiveRequest = function (obs, method, endpoint, data) {
        var _this = this;
        var activeRequestId = DataStoreService.getActiveRequestId(method, endpoint, data), existingActiveRequest = this.activeRequests.get(activeRequestId);
        if (existingActiveRequest)
            return existingActiveRequest;
        else {
            var warmObservable = obs.share();
            obs.finally(function () { return _this.activeRequests.delete(activeRequestId); });
            this.activeRequests.set(activeRequestId, warmObservable);
            return warmObservable;
        }
    };
    DataStoreService.getActiveRequestId = function (method, endpoint, data) {
        return method + "__" + endpoint + "__" + (data ? JSON.stringify(data) : '|');
    };
    return DataStoreService;
}());
exports.DataStoreService = DataStoreService;
