import {EntitiesServiceBase} from "./entities.service.base";
import {ModelObjectValue} from "../entity/object-value.config";

class ObjectValuesService extends EntitiesServiceBase<ModelObjectValue>{}

export let objectValuesService = new ObjectValuesService;
