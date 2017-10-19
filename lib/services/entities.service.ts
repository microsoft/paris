import {ModelEntity} from "../entity/entity.config";
import {EntitiesServiceBase} from "./entities.service.base";

export class EntitiesService extends EntitiesServiceBase<ModelEntity>{}

export let entitiesService = new EntitiesService();
