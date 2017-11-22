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
        return this.setActiveRequest(Observable_1.Observable.from(http_service_1.Http.get(this.getEndpointUrl(endpoint, baseUrl), data, this.config.http)), HttpVerb.get, endpoint, data);
    };
    // post(endpoint:string, data?:RequestData, baseUrl?:string):Observable<any>{
    // 	return this.http.post(this.getEndpointUrl(endpoint, baseUrl), data);
    // }
    DataStoreService.prototype.getEndpointUrl = function (endpoint, baseUrl) {
        return (baseUrl || this.config.apiRoot || "") + "/" + endpoint;
    };
    DataStoreService.prototype.setActiveRequest = function (obs, verb, endpoint, data) {
        var _this = this;
        var activeRequestId = DataStoreService.getActiveRequestId(verb, endpoint, data), existingActiveRequest = this.activeRequests.get(activeRequestId);
        if (existingActiveRequest)
            return existingActiveRequest;
        else {
            var warmObservable = obs.share();
            obs.finally(function () { return _this.activeRequests.delete(activeRequestId); });
            this.activeRequests.set(activeRequestId, warmObservable);
            return warmObservable;
        }
    };
    DataStoreService.getActiveRequestId = function (verb, endpoint, data) {
        return verb + "__" + endpoint + "__" + (data ? JSON.stringify(data) : '|');
    };
    return DataStoreService;
}());
exports.DataStoreService = DataStoreService;
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["get"] = "GET";
    HttpVerb["post"] = "POST";
})(HttpVerb || (HttpVerb = {}));
