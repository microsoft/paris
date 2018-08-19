import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {EntityModelBase} from "../models/entity-model.base";
import {DataSet} from "../dataset/dataset";
import {DataQuery} from "../dataset/data-query";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {Observable} from "rxjs";
import {DataStoreService} from "../services/data-store.service";
import {ParisConfig} from "../config/paris-config";
import {Paris} from "../services/paris";
import {ReadonlyRepository} from "./readonly-repository";
import {IReadonlyRepository} from "./repository.interface";
import {ModelBase} from "../models/model.base";
import {entityRelationshipsService} from "../services/entity-relationships.service";
import {EntityRelationshipConfig} from "../entity/entity-relationship";
import {RelationshipType} from "../models/relationship-type.enum";
import {EntityId} from "../models/entity-id.type";

const DEFAULT_RELATIONSHIP_TYPES = [RelationshipType.OneToMany, RelationshipType.OneToOne];

/**
 * A Repository is a service through which all of an Entity's data is fetched, cached and saved back to the backend.
 *
 * Relationship repository handles two repositories that are defined using a foreign key
 */
export class RelationshipRepository<TSource extends ModelBase, TData extends ModelBase> extends ReadonlyRepository<TData> implements IRelationshipRepository<TSource, TData> {
	private sourceRepository: ReadonlyRepository<TSource>;
	readonly relationshipConfig:EntityRelationshipConfig<TSource, TData>;

	sourceItem:TSource;
	readonly allowedTypes:Set<RelationshipType>;

	constructor(public sourceEntityType: DataEntityConstructor<TSource>,
				public dataEntityType: DataEntityConstructor<TData>,
				relationTypes:Array<RelationshipType>,
				paris: Paris) {
		super((dataEntityType.entityConfig || dataEntityType.valueObjectConfig), dataEntityType, paris);

		if (<Function>sourceEntityType === <Function>dataEntityType)
			throw new Error("RelationshipRepository doesn't support a single entity type.");

		let sourceEntityConfig = sourceEntityType.entityConfig || sourceEntityType.valueObjectConfig,
			sourceEntityName:string = sourceEntityConfig.singularName.replace(/\s/g, ""),
			dataEntityName:string = (dataEntityType.entityConfig || dataEntityType.valueObjectConfig).singularName.replace(/\s/g, "")

			this.relationshipConfig = entityRelationshipsService.getRelationship(this.sourceEntityType, this.dataEntityType);

		if (!this.relationshipConfig)
			throw new Error(`Can't create RelationshipRepository, since there's no defined relationship in ${sourceEntityName} for ${dataEntityName}.`);

		this.entityBackendConfig = Object.assign({}, dataEntityType.entityConfig, this.relationshipConfig);
		this.sourceRepository = paris.getRepository<TSource>(sourceEntityType);
		this.allowedTypes = new Set(relationTypes || DEFAULT_RELATIONSHIP_TYPES);
	}

	query(query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<TData>>{
		if (!this.sourceItem)
			throw new Error(`Can't query RelationshipRepository<${this.sourceEntityType.singularName}, ${this.dataEntityType.singularName}>, since no source item was defined.`);

		return this.queryForItem(this.sourceItem, query, dataOptions);
	}


	queryItem(query?: DataQuery, dataOptions: DataOptions = defaultDataOptions):Observable<TData>{
		if (!this.sourceItem)
			throw new Error(`Can't query RelationshipRepository<${this.sourceEntityType.singularName}, ${this.dataEntityType.singularName}>, since no source item was defined.`);

		return this.getRelatedItem(this.sourceItem, query, dataOptions);
	}

	queryForItem(item:TSource, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<TData>> {
		if (!this.allowedTypes.has(RelationshipType.OneToMany))
			throw new Error(`Can't query relationship ${this.sourceEntityType.singularName} -> ${this.dataEntityType.singularName} since it doesn't have the 'OneToMany' allowed type.`);

		let cloneQuery:DataQuery = Object.assign({}, query);

		if (!cloneQuery.where)
			cloneQuery.where = {};

		Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));

		return super.query(cloneQuery, dataOptions);
	}

	/**
	 * Queries the relationship for an item ID instead of sourceItem or entity/valueObject.
	 * Note: there has to be a foreignKey set in the RelationshipRepository config, otherwise this will not work.
	 * @param {EntityId} itemId
	 * @param {DataQuery} query
	 * @param {DataOptions} dataOptions
	 * @returns {Observable<DataSet<U extends ModelBase>>}
	 */
	queryForItemId(itemId:EntityId, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<TData>> {
		if (!this.allowedTypes.has(RelationshipType.OneToMany))
			throw new Error(`Can't query relationship ${this.sourceEntityType.singularName} -> ${this.dataEntityType.singularName} since it doesn't have the 'OneToMany' allowed type.`);

		let cloneQuery:DataQuery = Object.assign({}, query);

		if (!cloneQuery.where)
			cloneQuery.where = {};

		Object.assign(cloneQuery.where, this.getRelationQueryWhereById(itemId));

		return super.query(cloneQuery, dataOptions);
	}

	getRelatedItem(item:TSource, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions):Observable<TData>{
		if (!this.allowedTypes.has(RelationshipType.OneToOne))
			throw new Error(`Can't query relationship ${this.sourceEntityType.singularName} -> ${this.dataEntityType.singularName} since it doesn't have the 'OneToMany' allowed type.`);

		let cloneQuery:DataQuery = Object.assign({}, query);

		if (item) {
			if (!cloneQuery.where)
				cloneQuery.where = {};

			Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));
		}

		return super.queryItem(cloneQuery, dataOptions);
	}

	/**
	 * Returns a related item by an item ID
	 * Note: there has to be a foreignKey set in the RelationshipRepository config, otherwise this will not work.
	 * @param {EntityId} itemId
	 * @param {DataQuery} query
	 * @param {DataOptions} dataOptions
	 * @returns {Observable<U extends ModelBase>}
	 */
	getRelatedItemById(itemId:EntityId, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions):Observable<TData>{
		if (!this.allowedTypes.has(RelationshipType.OneToOne))
			throw new Error(`Can't query relationship ${this.sourceEntityType.singularName} -> ${this.dataEntityType.singularName} since it doesn't have the 'OneToMany' allowed type.`);

		let cloneQuery:DataQuery = Object.assign({}, query);

		if (itemId) {
			if (!cloneQuery.where)
				cloneQuery.where = {};

			Object.assign(cloneQuery.where, this.getRelationQueryWhereById(itemId));
		}

		return super.queryItem(cloneQuery, dataOptions);
	}

	private getRelationQueryWhere(item:TSource):{ [index:string]:any }{
		let where:{ [index:string]:any } = {};

		let sourceItemWhereQuery:{ [index:string]:any } = {};
		if (item && this.relationshipConfig.foreignKey && item instanceof EntityModelBase) {
			let entityTypeName:string = this.sourceEntityType.singularName.replace(/\s/g, "");
			sourceItemWhereQuery[this.relationshipConfig.foreignKey || entityTypeName] = item.id;
		}
		else if (this.relationshipConfig.getRelationshipData)
			Object.assign(sourceItemWhereQuery, this.relationshipConfig.getRelationshipData(item));

		return Object.assign(where, sourceItemWhereQuery);
	}

	private getRelationQueryWhereById(itemId:EntityId):{ [index:string]:any }{
		let sourceItemWhereQuery:{ [index:string]:any } = {};

		if (this.relationshipConfig.foreignKey)
			sourceItemWhereQuery[this.relationshipConfig.foreignKey] = itemId;

		return sourceItemWhereQuery;
	}
}

export interface IRelationshipRepository<TSource extends ModelBase = ModelBase, TData extends ModelBase = ModelBase> extends IReadonlyRepository<TData>{
	sourceEntityType: DataEntityType,
	dataEntityType: DataEntityType,
	relationshipConfig:EntityRelationshipConfig<TSource, TData>,
	queryForItem:(sourceItem:TSource, query?:DataQuery, dataOptions?:DataOptions) => Observable<DataSet<TData>>,
	getRelatedItem:(itemId?:any, query?: DataQuery, dataOptions?: DataOptions) => Observable<TData>,
	allowedTypes:Set<RelationshipType>
}
