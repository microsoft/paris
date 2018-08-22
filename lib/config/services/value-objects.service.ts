import {EntitiesServiceBase} from "./entities.service.base";
import {EntityConfigBase} from "../model-config";

export class ValueObjectsService extends EntitiesServiceBase<EntityConfigBase>{}

export let valueObjectsService = new ValueObjectsService;
