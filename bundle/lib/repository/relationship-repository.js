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
var entities_service_1 = require("../services/entities.service");
var value_objects_service_1 = require("../services/value-objects.service");
var RelationshipRepository = /** @class */ (function (_super) {
    __extends(RelationshipRepository, _super);
    function RelationshipRepository(sourceEntityType, dataEntityType, config, dataStore, paris) {
        var _this = _super.call(this, (dataEntityType.entityConfig || dataEntityType.valueObjectConfig), dataEntityType.entityConfig, config, dataEntityType, dataStore, paris) || this;
        _this.sourceEntityType = sourceEntityType;
        _this.dataEntityType = dataEntityType;
        if (sourceEntityType === dataEntityType)
            throw new Error("RelationshipRepository doesn't support a single entity type.");
        var relationshipConfig = (sourceEntityType.entityConfig || _this.sourceEntityType.valueObjectConfig).relationshipsMap.get(dataEntityType.name);
        if (!relationshipConfig)
            throw new Error("Can't create RelationshipRepository, since there's no defined relationship in " + sourceEntityType.entityConfig.singularName + " for " + dataEntityType.entityConfig.singularName + ".");
        _this.relationship = Object.assign({}, relationshipConfig, {
            entity: entities_service_1.entitiesService.getEntityByName(relationshipConfig.entity) || value_objects_service_1.valueObjectsService.getEntityByName(relationshipConfig.entity),
        });
        if (!_this.relationship.entity)
            throw new Error("Can't create RelationshipRepository, couldn't find entity '" + relationshipConfig.entity + "'.");
        _this.entityBackendConfig = Object.assign({}, _this.relationship.entity, _this.relationship);
        _this.sourceRepository = paris.getRepository(sourceEntityType);
        return _this;
    }
    RelationshipRepository.prototype.queryForItem = function (item, query, dataOptions) {
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        var cloneQuery = Object.assign({}, query);
        if (!cloneQuery.where)
            cloneQuery.where = {};
        Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));
        return this.query(cloneQuery, dataOptions);
    };
    RelationshipRepository.prototype.getRelatedItem = function (item, query, dataOptions) {
        if (dataOptions === void 0) { dataOptions = data_options_1.defaultDataOptions; }
        var cloneQuery = Object.assign({}, query);
        if (item) {
            if (!cloneQuery.where)
                cloneQuery.where = {};
            Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));
        }
        return this.queryItem(cloneQuery, dataOptions);
    };
    RelationshipRepository.prototype.getRelationQueryWhere = function (item) {
        var where = {};
        var sourceItemWhereQuery = {};
        if (item && this.relationship.foreignKey && item instanceof entity_model_base_1.EntityModelBase)
            sourceItemWhereQuery[this.relationship.foreignKey || this.sourceEntityType.entityConfig.singularName] = item.id;
        else if (this.relationship.getRelationshipData)
            Object.assign(sourceItemWhereQuery, this.relationship.getRelationshipData(item));
        return Object.assign(where, sourceItemWhereQuery);
    };
    return RelationshipRepository;
}(readonly_repository_1.ReadonlyRepository));
exports.RelationshipRepository = RelationshipRepository;
