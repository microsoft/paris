import {ModelEntity} from "../entity/entity.config";
import {EntitiesServiceBase} from "./entities.service.base";

class EntitiesService extends EntitiesServiceBase<ModelEntity>{}

export let entitiesService = new EntitiesService();
