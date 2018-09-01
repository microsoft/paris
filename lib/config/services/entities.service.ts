import {ModelEntity} from "../entity.config";
import {EntitiesServiceBase} from "./entities.service.base";

export class EntitiesService extends EntitiesServiceBase<ModelEntity>{}

export let entitiesService:EntitiesService = new EntitiesService();
