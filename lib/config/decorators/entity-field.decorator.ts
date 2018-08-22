import {DataEntityType} from "../../api/entity/data-entity.base";
import {FieldConfig} from "../entity-field.config";
import {entityFieldsService} from "../services/entity-fields.service";
import {Field} from "../../api/entity/entity-field";

/**
 * All properties of models (Entity/ValueObject) that should be handled by Paris should be decorated with `EntityField`.
 * When Paris creates an instance of a model, it maps the raw data arrived from backend to class properties, through EntityFields.
 *
 * @param {FieldConfig} fieldConfig
 */
export function EntityField(fieldConfig?:FieldConfig):PropertyDecorator {
	return function (entityPrototype: DataEntityType, propertyKey: string | symbol) {
		let propertyConstructor:Function = (<any>Reflect).getMetadata("design:type", entityPrototype, propertyKey);

		fieldConfig = fieldConfig || {};
		let field:Field = Object.assign({}, fieldConfig);
		if (!field.id)
			field.id = String(propertyKey);

		field.type = fieldConfig.arrayOf || propertyConstructor;
		field.isArray = propertyConstructor === Array;
		entityFieldsService.addField(entityPrototype, field);
	}
}
