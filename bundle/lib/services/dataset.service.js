"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_query_sort_1 = require("../dataset/data-query-sort");
var DatasetService = /** @class */ (function () {
    function DatasetService() {
    }
    DatasetService.queryToHttpOptions = function (query) {
        if (!query)
            return null;
        var httpOptions = {};
        httpOptions.params = {};
        if (query.pageSize && query.pageSize > 0)
            httpOptions.params.pagesize = query.pageSize;
        if (query.page && query.page > 1)
            httpOptions.params.page = query.page;
        if (query.sortBy) {
            httpOptions.params.sortBy = query.sortBy.map(function (sortField) {
                return "" + (sortField.direction === data_query_sort_1.DataQuerySortDirection.descending ? '-' : '') + sortField.field;
            }).join(",");
        }
        if (query.where)
            Object.assign(httpOptions.params, query.where);
        return httpOptions;
    };
    return DatasetService;
}());
exports.DatasetService = DatasetService;
