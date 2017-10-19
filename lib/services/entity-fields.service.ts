import {DataEntityType} from "../entity/data-entity.base";
import {EntityFields} from "../entity/entity-fields";
import {Field} from "../entity/entity-field";

export class EntityFieldsService{
	protected fields:Map<DataEntityType, EntityFields> = new Map;

	addField(dataEntityType:DataEntityType, field:Field):void{
		let dataTypeFields:EntityFields = this.getDataTypeFields(dataEntityType);
		if (!dataTypeFields)
			this.fields.set(dataEntityType, dataTypeFields = new Map);

		dataTypeFields.set(field.id, field);
	}

	getDataTypeFields(dataEntityType:DataEntityType):EntityFields{
		return this.fields.get(dataEntityType) || this.fields.get(dataEntityType.prototype);
	}
}

export const entityFieldsService = new EntityFieldsService;
