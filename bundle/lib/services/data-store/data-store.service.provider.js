"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_service_1 = require("./data-store.service");
exports.dataStoreServiceFactory = function (http, dataStoreOptions) {
    return new data_store_service_1.DataStoreService(http, Object.assign({}, defaultDataStoreOptions, dataStoreOptions));
};
var defaultDataStoreOptions = {
    apiRoot: "/",
    allItemsProperty: "items",
    entityIdProperty: "id"
};
