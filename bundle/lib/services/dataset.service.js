"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dataset_options_sort_1 = require("../dataset/dataset-options-sort");
var DatasetService = /** @class */ (function () {
    function DatasetService() {
    }
    DatasetService.dataSetOptionsToHttpOptions = function (dataSetOptions) {
        if (!dataSetOptions)
            return null;
        var httpOptions = {};
        if (dataSetOptions.params) {
            httpOptions.params = {};
            if (dataSetOptions.params.pageSize && dataSetOptions.params.pageSize > 0)
                httpOptions.params.pagesize = dataSetOptions.params.pageSize;
            if (dataSetOptions.params.page && dataSetOptions.params.page > 1)
                httpOptions.params.page = dataSetOptions.params.page;
            if (dataSetOptions.params.sortBy) {
                httpOptions.params.sortBy = dataSetOptions.params.sortBy.map(function (sortField) {
                    return "" + (sortField.direction === dataset_options_sort_1.DataSetOptionsSortDirection.descending ? '-' : '') + sortField.field;
                }).join(",");
            }
            if (dataSetOptions.params.query)
                Object.assign(httpOptions.params, dataSetOptions.params.query);
        }
        if (dataSetOptions.data)
            httpOptions.data = dataSetOptions.data;
        return httpOptions;
    };
    return DatasetService;
}());
exports.DatasetService = DatasetService;
