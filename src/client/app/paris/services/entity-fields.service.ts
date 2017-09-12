import {DataEntityType} from "../entity/data-entity.base";
import {Field} from "../entity/entity-field";

class EntityFieldsService{
	private allEntityFields:Map<DataEntityType, FieldsIndex> = new Map();

	getDataEntityTypeFields(dataEntityType:DataEntityType):FieldsIndex{
		let parentEntity:DataEntityType = Object.getPrototypeOf(dataEntityType).prototype,
			parentDataTypeFields:FieldsIndex = this.allEntityFields.get(parentEntity) ? this.getDataEntityTypeFields(parentEntity) : {};

		return Object.assign(parentDataTypeFields, this.allEntityFields.get(dataEntityType) || this.allEntityFields.get(dataEntityType.prototype));
	}

	addEntityField(dataEntityType:DataEntityType, field:Field):void{
		let dataTypeFields:FieldsIndex = this.allEntityFields.get(dataEntityType);
		if (!dataTypeFields)
			this.allEntityFields.set(dataEntityType, dataTypeFields = {});

		dataTypeFields[field.id] = field;
	}
}

export let entityFieldsService = new EntityFieldsService();

export interface FieldsIndex{
	[fieldId:string]:Field
}
