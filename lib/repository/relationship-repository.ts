import {DataEntityConstructor} from "../entity/data-entity.base";
import {EntityModelBase} from "../models/entity-model.base";
import {DataSet} from "../dataset/dataset";
import {DataQuery} from "../dataset/data-query";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {Observable} from "rxjs/Observable";
import {DataStoreService} from "../services/data-store.service";
import {ParisConfig} from "../config/paris-config";
import {Paris} from "../services/paris";
import {EntityRelationship, IEntityRelationship} from "../entity/entity-relationship";
import {ReadonlyRepository} from "./readonly-repository";
import {IReadonlyRepository} from "./repository.interface";
import {entitiesService} from "../services/entities.service";
import {ModelBase} from "../models/model.base";
import {valueObjectsService} from "../services/value-objects.service";

export class RelationshipRepository<T extends ModelBase, U extends ModelBase> extends ReadonlyRepository<U> implements IRelationshipRepository {
	private sourceRepository: ReadonlyRepository<T>;
	private relationship: EntityRelationship;

	constructor(public sourceEntityType: DataEntityConstructor<T>,
				public dataEntityType: DataEntityConstructor<U>,
				config: ParisConfig,
				dataStore: DataStoreService,
				paris: Paris) {
		super((dataEntityType.entityConfig || dataEntityType.valueObjectConfig), dataEntityType.entityConfig, config, dataEntityType, dataStore, paris);

		if (sourceEntityType === dataEntityType)
			throw new Error("RelationshipRepository doesn't support a single entity type.");

		let relationshipConfig:IEntityRelationship = (sourceEntityType.entityConfig || this.sourceEntityType.valueObjectConfig).relationshipsMap.get(dataEntityType.name);
		if (!relationshipConfig)
			throw new Error(`Can't create RelationshipRepository, since there's no defined relationship in ${sourceEntityType.name} for ${dataEntityType.name}.`);

		this.relationship = Object.assign({}, relationshipConfig, {
			entity: entitiesService.getEntityByName(relationshipConfig.entity) || valueObjectsService.getEntityByName(relationshipConfig.entity),
		});

		if (!this.relationship.entity)
			throw new Error(`Can't create RelationshipRepository, couldn't find entity '${relationshipConfig.entity}'.`);

		this.entityBackendConfig = Object.assign({}, this.relationship.entity, this.relationship);

		this.sourceRepository = paris.getRepository<T>(sourceEntityType);
	}

	queryForItem(item:ModelBase, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<U>> {
		let cloneQuery:DataQuery = Object.assign({}, query);

		if (!cloneQuery.where)
			cloneQuery.where = {};

		Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));

		return this.query(cloneQuery, dataOptions);
	}

	getRelatedItem(item:ModelBase, query?: DataQuery, dataOptions: DataOptions = defaultDataOptions):Observable<U>{
		let cloneQuery:DataQuery = Object.assign({}, query);

		if (item) {
			if (!cloneQuery.where)
				cloneQuery.where = {};

			Object.assign(cloneQuery.where, this.getRelationQueryWhere(item));
		}

		return this.queryItem(cloneQuery, dataOptions);
	}

	private getRelationQueryWhere(item:ModelBase):{ [index:string]:any }{
		let where:{ [index:string]:any } = {};

		let sourceItemWhereQuery:{ [index:string]:any } = {};
		if (item && this.relationship.foreignKey && item instanceof EntityModelBase)
			sourceItemWhereQuery[this.relationship.foreignKey || this.sourceEntityType.name] = item.id;
		else if (this.relationship.getRelationshipData)
			Object.assign(sourceItemWhereQuery, this.relationship.getRelationshipData(item));

		return Object.assign(where, sourceItemWhereQuery);
	}
}

export interface IRelationshipRepository extends IReadonlyRepository{
	queryForItem:(item:EntityModelBase, query?:DataQuery, dataOptions?:DataOptions) => Observable<DataSet<ModelBase>>,
	getRelatedItem:(itemId?:any, query?: DataQuery, dataOptions?: DataOptions) => Observable<ModelBase>
}
