import {DataEntityType} from "./data-entity.base";
import {valueObjectsService} from "../services/value-objects.service";
import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";

export function ValueObject(config:IEntityConfigBase){
	return (target:DataEntityType) => {
		let valueObjectConfig:EntityConfigBase = new EntityConfigBase(config, target.prototype.constructor);
		target.singularName = valueObjectConfig.singularName;
		target.pluralName = valueObjectConfig.pluralName;
		target.valueObjectConfig = valueObjectConfig;
		valueObjectsService.addEntity(target, valueObjectConfig);
	}
}
