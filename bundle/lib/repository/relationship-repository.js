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
var entity_model_base_1 = require("../models/entity-model.base");
var data_options_1 = require("../dataset/data.options");
var readonly_repository_1 = require("./readonly-repository");
var entity_relationships_service_1 = require("../services/entity-relationships.service");
var RelationshipRepository = /** @class */ (function (_super) {
    __extends(RelationshipRepository, _super);
    function RelationshipRepository(sourceEntityType, dataEntityType, config, dataStore, paris) {
        var _this = _super.call(this, (dataEntityType.entityConfig || dataEntityType.valueObjectConfig), dataEntityType.entityConfig, config, dataEntityType, dataStore, paris) || this;
        _this.sourceEntityType = sourceEntityType;
        _this.dataEntityType = dataEntityType;
        if (sourceEntityType === dataEntityType)
            throw new Error("RelationshipRepository doesn't support a single entity type.");
        var sourceEntityConfig = sourceEntityType.entityConfig || sourceEntityType.valueObjectConfig, sourceEntityName = sourceEntityConfig.singularName.replace(/\s/g, ""), dataEntityName = (dataEntityType.entityConfig || dataEntityType.valueObjectConfig).singularName.replace(/\s/g, "");
        _this.relationshipConfig = entity_relationships_service_1.entityRelationshipsService.getRelationship(_this.sourceEntityType, _this.dataEntityType);
        if (!_this.relationshipConfig)
            throw new Error("Can't create RelationshipRepository, since there's no defined relationship in " + sourceEntityName + " for " + dataEntityName + ".");
        _this.entityBackendConfig = Object.assign({}, dataEntityType.entityConfig, _this.relationshipConfig);
        _this.sourceRepository = paris.getRepository(sourceEntityType);
        return _this;
    }
    RelationshipRepository.prototype.query = function (query, dataOptions) {
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        if (!this.sourceItem)
            throw new Error("Can't query RelationshipRepository<" + this.sourceEntityType.singularName + ", " + this.dataEntityType.singularName + ">, since no source item was defined.");
        return this.queryForItem(this.sourceItem, query, dataOptions);
    };
    RelationshipRepository.prototype.queryItem = function (query, dataOptions) {
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        if (!this.sourceItem)
            throw new Error("Can't query RelationshipRepository<" + this.sourceEntityType.singularName + ", " + this.dataEntityType.singularName + ">, since no source item was defined.");
        return this.getRelatedItem(this.sourceItem, query, dataOptions);
    };
    RelationshipRepository.prototype.queryForItem = function (item, query, dataOptions) {
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        var cloneQuery = Object.assign({}, query);
        if (!cloneQuery.where)
            cloneQuery.where = {};
        Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));
        return _super.prototype.query.call(this, cloneQuery, dataOptions);
    };
    RelationshipRepository.prototype.getRelatedItem = function (item, query, dataOptions) {
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        var cloneQuery = Object.assign({}, query);
        if (item) {
            if (!cloneQuery.where)
                cloneQuery.where = {};
            Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));
        }
        return _super.prototype.queryItem.call(this, cloneQuery, dataOptions);
    };
    RelationshipRepository.prototype.getRelationQueryWhere = function (item) {
        var where = {};
        var sourceItemWhereQuery = {};
        if (item && this.relationshipConfig.foreignKey && item instanceof entity_model_base_1.EntityModelBase) {
            var entityTypeName = this.sourceEntityType.singularName.replace(/\s/g, "");
            sourceItemWhereQuery[this.relationshipConfig.foreignKey || entityTypeName] = item.id;
        }
        else if (this.relationshipConfig.getRelationshipData)
            Object.assign(sourceItemWhereQuery, this.relationshipConfig.getRelationshipData(item));
        return Object.assign(where, sourceItemWhereQuery);
    };
    return RelationshipRepository;
}(readonly_repository_1.ReadonlyRepository));
exports.RelationshipRepository = RelationshipRepository;
