import {DataEntityType} from "../../api/entity/data-entity.base";
import {valueObjectsService} from "../services/value-objects.service";
import {EntityConfigBase, IEntityConfigBase} from "../model-config";

export function ValueObject(config:IEntityConfigBase){
	return (target:DataEntityType) => {
		let valueObjectConfig:EntityConfigBase = new EntityConfigBase(config, target.prototype.constructor);
		target.singularName = valueObjectConfig.singularName;
		target.pluralName = valueObjectConfig.pluralName;
		target.valueObjectConfig = valueObjectConfig;
		valueObjectsService.addEntity(target, valueObjectConfig);
	}
}
