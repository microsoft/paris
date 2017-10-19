import { Repository } from "./repository";
import { IRepository } from "./repository.interface";
import { DataEntityConstructor } from "../entity/data-entity.base";
import { Subject } from "rxjs/Subject";
import { DataStoreService } from "../services/data-store/data-store.service";
import { IIdentifiable } from "../models/identifiable.model";
import { ParisConfig } from "../config/paris-config";
export declare class RepositoryManagerService {
    private dataStore;
    private config;
    private repositories;
    save$: Subject<RepositoryEvent>;
    constructor(dataStore: DataStoreService, config: ParisConfig);
    getRepository<T extends IIdentifiable>(entityConstructor: DataEntityConstructor<T>): Repository<T> | null;
}
export interface RepositoryEvent {
    repository: IRepository;
    item: any;
}
