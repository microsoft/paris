import {Injectable} from "@angular/core";
import {Repository} from "./repository";
import {IRepository} from "./repository.interface";
import {ModelEntity} from "../entity/entity.config";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Subject} from "rxjs/Subject";
import {entitiesService} from "../services/entities.service";
import {DataStoreService} from "../services/data-store/data-store.service";
import {IIdentifiable} from "../models/identifiable.model";

@Injectable()
export class RepositoryManagerService{
	private repositories:Map<DataEntityType, IRepository> = new Map();

	save$:Subject<RepositoryEvent> = new Subject();

	constructor(private dataStore:DataStoreService){}

	getRepository<T extends IIdentifiable>(entityConstructor:DataEntityConstructor<T>):Repository<T> | null{
		let repository:Repository<T> = <Repository<T>>this.repositories.get(entityConstructor);
		if (!repository) {
			let entityConfig:ModelEntity = entitiesService.getEntityByType(entityConstructor);
			if (!entityConfig)
				return null;

			repository = new Repository<T>(entityConfig, entityConstructor, this.dataStore, this);
			this.repositories.set(entityConstructor, repository);

			repository.save$.subscribe(savedItem => this.save$.next({ repository: repository, item: savedItem }));
		}

		return repository;
	}
}

export interface RepositoryEvent{
	repository:IRepository,
	item:any
}
