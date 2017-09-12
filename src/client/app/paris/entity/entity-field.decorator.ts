import {DataEntityType} from "./data-entity.base";
import {Field} from "./entity-field";
import {entityFieldsService} from "../services/entity-fields.service";

export function EntityField(fieldConfig:Field):PropertyDecorator {
	return function (entityPrototype: DataEntityType, propertyKey: string | symbol) {
		let propertyConstructor:DataEntityType = Reflect.getMetadata("design:type", entityPrototype, propertyKey);
		let fieldConfigCopy:Field = Object.assign({}, fieldConfig);
		if (!fieldConfigCopy.id)
			fieldConfigCopy.id = String(propertyKey);

		fieldConfigCopy.type = propertyConstructor;

		entityFieldsService.addEntityField(entityPrototype, fieldConfigCopy);
	}
}
