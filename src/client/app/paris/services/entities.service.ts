import {DataEntityType} from "../entity/data-entity.base";
import {ModelEntity} from "../entity/entity.config";
import {Field} from "../entity/entity-field";
import {EntityFields} from "../entity/entity-fields";

class EntitiesService{
	private allEntities:Map<DataEntityType, ModelEntity> = new Map;
	private tempEntityFields:Map<DataEntityType, EntityFields> = new Map;

	getEntityByType(dataEntityType:DataEntityType):ModelEntity{
		return this.allEntities.get(dataEntityType) || this.allEntities.get(dataEntityType.prototype);
	}

	addEntity(dataEntityType:DataEntityType, entity:ModelEntity):ModelEntity{
		if (!this.allEntities.has(dataEntityType.prototype))
			this.allEntities.set(dataEntityType.prototype, entity);

		entity.fields = this.getDataEntityTypeFields(dataEntityType);

		// TODO: Clear the tempEntityFields once the entity is populated, without affecting inherited fields.

		return entity;
	}

	addEntityField(dataEntityType:DataEntityType, field:Field):void{
		let entity:ModelEntity = this.getEntityByType(dataEntityType);

		let dataTypeFields:EntityFields = entity ? entity.fields : this.getTempDataTypeFields(dataEntityType);
		if (!dataTypeFields)
			this.tempEntityFields.set(dataEntityType, dataTypeFields = new Map);

		dataTypeFields.set(field.id, field);
	}

	private getDataEntityTypeFields(dataEntityType:DataEntityType):EntityFields{
		if (!dataEntityType)
			return null;

		let parentEntityDataType:DataEntityType = Object.getPrototypeOf(dataEntityType).prototype,
			parentEntity:ModelEntity = this.allEntities.get(parentEntityDataType),
			parentDataTypeFields:EntityFields = parentEntity && parentEntity.fields || this.getDataEntityTypeFields(parentEntityDataType) || null;

		let fullDataEntityTypeFields:EntityFields = new Map;
		if (parentDataTypeFields)
			parentDataTypeFields.forEach((field:Field, fieldId:string) => fullDataEntityTypeFields.set(fieldId, field));

		let dataEntity:ModelEntity = this.getEntityByType(dataEntityType);
		let dataEntityTypeFields:EntityFields = dataEntity && dataEntity.fields || this.getTempDataTypeFields(dataEntityType);

		if (dataEntityTypeFields)
			dataEntityTypeFields.forEach((field:Field, fieldId:string) => fullDataEntityTypeFields.set(fieldId, field));

		return fullDataEntityTypeFields;
	}

	private getTempDataTypeFields(dataEntityType:DataEntityType):EntityFields{
		return this.tempEntityFields.get(dataEntityType) || this.tempEntityFields.get(dataEntityType.prototype);
	}
}

export let entitiesService = new EntitiesService();
