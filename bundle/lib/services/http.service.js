"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var Http = /** @class */ (function () {
    function Http() {
    }
    Http.get = function (url, options, httpConfig) {
        return Http.request("GET", url, options, httpConfig);
    };
    Http.post = function (url, options, httpConfig) {
        return Http.request("POST", url, options, httpConfig);
    };
    Http.put = function (url, options, httpConfig) {
        return Http.request("PUT", url, options, httpConfig);
    };
    Http.delete = function (url, options, httpConfig) {
        return Http.request("DELETE", url, options, httpConfig);
    };
    Http.patch = function (url, options, httpConfig) {
        return Http.request("PATCH", url, options, httpConfig);
    };
    Http.request = function (method, url, options, httpConfig) {
        var fullUrl = options && options.params ? Http.addParamsToUrl(url, options.params, options.separateArrayParams) : url, tmpError = new Error("Failed to " + method + " from " + url + ".");
        if (options && options.data) {
            httpConfig = httpConfig || {};
            if (!httpConfig.headers)
                httpConfig.headers = {};
            httpConfig.headers["Content-Type"] = "application/json";
        }
        return Observable_1.Observable.ajax(Object.assign({
            method: method,
            url: fullUrl,
            body: options && options.data
        }, Http.httpOptionsToRequestInit(options, httpConfig)))
            .map(function (e) { return e.response; })
            .catch(function () { throw tmpError; });
    };
    Http.httpOptionsToRequestInit = function (options, httpConfig) {
        if (!options && !httpConfig)
            return null;
        var requestOptions = {};
        if (options) {
            if (options.data)
                requestOptions.body = options.data;
        }
        if (httpConfig) {
            if (httpConfig.headers)
                requestOptions.headers = httpConfig.headers;
        }
        return requestOptions;
    };
    Http.addParamsToUrl = function (url, params, separateArrayParams) {
        if (separateArrayParams === void 0) { separateArrayParams = false; }
        if (params && !/\?/.test(url))
            return url + "?" + Http.getParamsQuery(params, separateArrayParams);
        return params && !/\?/.test(url) ? url + "?" + Http.getParamsQuery(params, separateArrayParams) : url;
    };
    Http.getParamsQuery = function (params, separateArrayParams) {
        if (separateArrayParams === void 0) { separateArrayParams = false; }
        var paramsArray = [];
        var _loop_1 = function (param) {
            var paramValue = params[param];
            if (separateArrayParams && paramValue instanceof Array)
                paramsArray = paramsArray.concat(paramValue.map(function (value) { return param + "=" + encodeURIComponent(String(value)); }));
            else {
                var value = encodeURIComponent(String(params[param]));
                paramsArray.push(param + "=" + value);
            }
        };
        for (var param in params) {
            _loop_1(param);
        }
        return paramsArray.join("&");
    };
    return Http;
}());
exports.Http = Http;
