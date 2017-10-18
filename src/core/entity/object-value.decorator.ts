import {DataEntityType} from "./data-entity.base";
import {ModelObjectValue, ObjectValueConfig} from "./object-value.config";
import {objectValuesService} from "../services/object-values.service";

export function ObjectValue(config:ObjectValueConfig){
	return (target:DataEntityType) => {
		if (config.values)
			config.values = config.values.map(valueConfig => new target.prototype.constructor(valueConfig));

		let objectValueConfig:ModelObjectValue = new ModelObjectValue(config);
		target.objectValueConfig = objectValueConfig;
		objectValuesService.addEntity(target, objectValueConfig);
	}
}
