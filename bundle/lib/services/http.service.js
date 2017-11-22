"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var Http = /** @class */ (function () {
    function Http() {
    }
    Http.get = function (url, options, httpConfig) {
        var fullUrl = options && options.params ? Http.addParamsToUrl(url, options.params) : url, tmpError = new Error("Failed to GET from " + url + ".");
        return Observable_1.Observable.ajax(Object.assign({
            url: fullUrl
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
    Http.addParamsToUrl = function (url, params) {
        if (params && !/\?/.test(url))
            return url + "?" + Http.getParamsQuery(params);
        return params && !/\?/.test(url) ? url + "?" + Http.getParamsQuery(params) : url;
    };
    Http.getParamsQuery = function (params) {
        var paramsArray = [];
        for (var param in params) {
            var value = encodeURIComponent(String(params[param]));
            paramsArray.push(param + "=" + value);
        }
        return paramsArray.join("&");
    };
    return Http;
}());
exports.Http = Http;
