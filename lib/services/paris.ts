import {defaultConfig, ParisConfig} from "../config/paris-config";
import {EntityModelBase} from "../models/entity-model.base";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Repository} from "../repository/repository";
import {EntityConfig, ModelEntity} from "../entity/entity.config";
import {entitiesService} from "./entities.service";
import {IRepository} from "../repository/repository.interface";
import {DataStoreService} from "./data-store.service";
import {EntityConfigBase, IEntityConfigBase} from "../entity/entity-config.base";
import {Observable} from "rxjs/Observable";
import {SaveEntityEvent} from "../events/save-entity.event";
import {Subject} from "rxjs/Subject";
import {RemoveEntitiesEvent} from "../events/remove-entities.event";
import {IRelationshipRepository, RelationshipRepository} from "../repository/relationship-repository";
import {ModelBase} from "../models/model.base";
import {valueObjectsService} from "./value-objects.service";
import {EntityRelationshipRepositoryType} from "../entity/entity-relationship-repository-type";

export class Paris{
	private repositories:Map<DataEntityType, IRepository> = new Map;
	private relationshipRepositories:Map<string, IRelationshipRepository> = new Map;
	readonly dataStore:DataStoreService;
	readonly config:ParisConfig;

	save$:Observable<SaveEntityEvent>;
	private _saveSubject$:Subject<SaveEntityEvent> = new Subject;

	remove$:Observable<RemoveEntitiesEvent>;
	private _removeSubject$:Subject<RemoveEntitiesEvent> = new Subject;

	constructor(config?:ParisConfig){
		this.config = Object.assign({}, defaultConfig, config);
		this.dataStore = new DataStoreService(this.config);

		this.save$ = this._saveSubject$.asObservable();
		this.remove$ = this._removeSubject$.asObservable();
	}

	getRepository<T extends ModelBase>(entityConstructor:DataEntityConstructor<T>):Repository<T> | null{
		let repository:Repository<T> = <Repository<T>>this.repositories.get(entityConstructor);
		if (!repository) {
			let entityConfig:EntityConfig = entitiesService.getEntityByType(entityConstructor) || valueObjectsService.getEntityByType(entityConstructor);
			if (!entityConfig)
				return null;

			repository = new Repository<T>(entityConfig, this.config, entityConstructor, this.dataStore, this);
			this.repositories.set(entityConstructor, repository);

			// If the entity has an endpoint, it means it connects to the backend, so subscribe to save/delete events to enable global events:
			if (entityConfig.endpoint){
				repository.save$.subscribe((saveEvent:SaveEntityEvent) => this._saveSubject$.next(saveEvent));
				repository.remove$.subscribe((removeEvent:RemoveEntitiesEvent) => this._removeSubject$.next(removeEvent));
			}
		}

		return repository;
	}

	getRelationshipRepository<T extends ModelBase, U extends ModelBase>(relationshipConstructor:Function):RelationshipRepository<T, U>{
		const relationship:EntityRelationshipRepositoryType<T, U> = <EntityRelationshipRepositoryType<T, U>>relationshipConstructor;

		let sourceEntityName:string = relationship.sourceEntityType.singularName.replace(/\s/g, ""),
			dataEntityName:string = relationship.dataEntityType.singularName.replace(/\s/g, "");

		let relationshipId:string = `${sourceEntityName}_${dataEntityName}`;

		let repository:RelationshipRepository<T, U> = <RelationshipRepository<T, U>>this.relationshipRepositories.get(relationshipId);
		if (!repository) {
			repository = new RelationshipRepository<T, U>(relationship.sourceEntityType, relationship.dataEntityType, this.config, this.dataStore, this);
			this.relationshipRepositories.set(relationshipId, repository);
		}

		return repository;
	}

	getModelBaseConfig(entityConstructor:DataEntityType):EntityConfigBase{
		return entityConstructor.entityConfig || entityConstructor.valueObjectConfig;
	}
}
