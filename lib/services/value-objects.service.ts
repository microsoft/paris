import {EntitiesServiceBase} from "./entities.service.base";
import {EntityConfigBase} from "../entity/entity-config.base";

export class ValueObjectsService extends EntitiesServiceBase<EntityConfigBase>{}

export let valueObjectsService = new ValueObjectsService;
