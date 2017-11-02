import {defaultConfig, ParisConfig} from "../config/paris-config";
import {EntityModelBase} from "../models/entity-model.base";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Repository} from "../repository/repository";
import {ModelEntity} from "../entity/entity.config";
import {entitiesService} from "./entities.service";
import {IRepository} from "../repository/repository.interface";
import {DataStoreService} from "./data-store.service";

export class Paris{
	private repositories:Map<DataEntityType, IRepository> = new Map();
	private dataStore:DataStoreService;
	readonly config:ParisConfig;

	constructor(config?:ParisConfig){
		this.config = Object.assign({}, defaultConfig, config);
		this.dataStore = new DataStoreService(this.config);
	}

	getRepository<T extends EntityModelBase>(entityConstructor:DataEntityConstructor<T>):Repository<T> | null{
		let repository:Repository<T> = <Repository<T>>this.repositories.get(entityConstructor);
		if (!repository) {
			let entityConfig:ModelEntity = entitiesService.getEntityByType(entityConstructor);
			if (!entityConfig)
				return null;

			repository = new Repository<T>(entityConfig, this.config, entityConstructor, this.dataStore, this);
			this.repositories.set(entityConstructor, repository);
		}

		return repository;
	}
}
