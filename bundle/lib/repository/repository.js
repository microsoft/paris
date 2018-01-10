"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
var _ = require("lodash");
var readonly_repository_1 = require("./readonly-repository");
var Repository = /** @class */ (function (_super) {
    __extends(Repository, _super);
    function Repository(entity, config, entityConstructor, dataStore, paris) {
        var _this = _super.call(this, entity, entity, config, entityConstructor, dataStore, paris) || this;
        var getAllItems$ = _this.query().map(function (dataSet) { return dataSet.items; });
        _this._allItemsSubject$ = new Subject_1.Subject();
        _this._allItems$ = Observable_1.Observable.merge(getAllItems$, _this._allItemsSubject$.asObservable());
        _this._saveSubject$ = new Subject_1.Subject();
        _this._removeSubject$ = new Subject_1.Subject();
        _this.save$ = _this._saveSubject$.asObservable();
        _this.remove$ = _this._removeSubject$.asObservable();
        return _this;
    }
    /**
     * Saves an entity to the server
     * @param {T} item
     * @returns {Observable<T extends EntityModelBase>}
     */
    Repository.prototype.save = function (item) {
        var _this = this;
        if (!this.entityBackendConfig.endpoint)
            throw new Error("Entity " + this.entityConstructor.name + " can't be saved - it doesn't specify an endpoint.");
        try {
            var isNewItem_1 = item.id === undefined;
            var saveData = this.serializeItem(item);
            return this.dataStore.save(this.endpointName + "/" + (item.id || ''), isNewItem_1 ? "POST" : "PUT", { data: saveData }, this.baseUrl)
                .flatMap(function (savedItemData) { return savedItemData ? _this.createItem(savedItemData) : Observable_1.Observable.of(null); })
                .do(function (savedItem) {
                if (savedItem && _this._allValues) {
                    _this._allValues = _this._allValues.concat([savedItem]);
                    _this._allItemsSubject$.next(_this._allValues);
                }
                _this._saveSubject$.next({ entity: _this.entityConstructor, newValue: item, isNew: isNewItem_1 });
            });
        }
        catch (e) {
            return Observable_1.Observable.throw(e);
        }
    };
    /**
     * Saves multiple items to the server, all at once
     * @param {Array<T extends EntityModelBase>} items
     * @returns {Observable<Array<T extends EntityModelBase>>}
     */
    Repository.prototype.saveItems = function (items) {
        var _this = this;
        if (!this.entityBackendConfig.endpoint)
            throw new Error(this.entity.pluralName + " can't be saved - it doesn't specify an endpoint.");
        var newItems = { method: "POST", items: [] }, existingItems = { method: "PUT", items: [] };
        items.forEach(function (item) {
            (item.id === undefined ? newItems : existingItems).items.push(_this.serializeItem(item));
        });
        var saveItemsArray = [newItems, existingItems]
            .filter(function (saveItems) { return saveItems.items.length; })
            .map(function (saveItems) { return _this.doSaveItems(saveItems.items, saveItems.method); });
        return Observable_1.Observable.combineLatest.apply(this, saveItemsArray).map(function (savedItems) { return _.flatMap(savedItems); });
    };
    /**
     * Does the actual saving to server for a list of items.
     * @param {Array<any>} itemsData
     * @param {"PUT" | "POST"} method
     * @returns {Observable<Array<T extends EntityModelBase>>}
     */
    Repository.prototype.doSaveItems = function (itemsData, method) {
        var _this = this;
        return this.dataStore.save(this.endpointName + "/", method, { data: { items: itemsData } }, this.baseUrl)
            .flatMap(function (savedItemsData) {
            if (!savedItemsData)
                return Observable_1.Observable.of(null);
            var itemsData = savedItemsData instanceof Array ? savedItemsData : savedItemsData.items;
            var itemCreators = itemsData.map(function (savedItemData) { return _this.createItem(savedItemData); });
            return Observable_1.Observable.combineLatest.apply(_this, itemCreators);
        });
    };
    Repository.prototype.remove = function (items, options) {
        var _this = this;
        if (!items)
            throw new Error("No " + this.entity.pluralName.toLowerCase() + " specified for removing.");
        if (!(items instanceof Array))
            items = [items];
        if (!items.length)
            return Observable_1.Observable.of([]);
        if (!this.entityBackendConfig.endpoint)
            throw new Error("Entity " + this.entityConstructor.name + " can't be deleted - it doesn't specify an endpoint.");
        try {
            var httpOptions = options || { data: {} };
            httpOptions.data.ids = items.map(function (item) { return item.id; });
            return this.dataStore.delete(this.endpointName, httpOptions, this.baseUrl)
                .do(function () {
                if (_this._allValues) {
                    items.forEach(function (item) {
                        var itemIndex = _.findIndex(_this._allValues, function (_item) { return _item.id === item.id; });
                        if (~itemIndex)
                            _this._allValues.splice(itemIndex, 1);
                    });
                    _this._allItemsSubject$.next(_this._allValues);
                }
                _this._removeSubject$.next({ entity: _this.entityConstructor, items: items });
            }).map(function () { return items; });
        }
        catch (e) {
            return Observable_1.Observable.throw(e);
        }
    };
    return Repository;
}(readonly_repository_1.ReadonlyRepository));
exports.Repository = Repository;
