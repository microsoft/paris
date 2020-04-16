import {DataEntityType} from "../../api/entity/data-entity.base";
import {Field} from "../../api/entity/entity-field";
import {EntityFields} from "../../api/entity/entity-fields";
import {EntityConfigBase} from "../model-config";
import {entityFieldsService} from "./entity-fields.service";
import {EntityId} from "../../modeling/entity-id.type";

export abstract class EntitiesServiceBase<T extends EntityConfigBase, TRawData = any, TId extends EntityId = string>{
	protected _allEntities:Map<DataEntityType, T> = new Map;
	protected _allEntitiesByName:Map<string, T> = new Map;

	get allEntities():Array<T>{
		return Array.from(this._allEntities.values());
	}

	getEntityByType(dataEntityType:DataEntityType):T{
		return this._allEntities.get(dataEntityType) || this._allEntities.get(dataEntityType.prototype);
	}

	getEntityByName(entitySingularName:string):T{
		return this._allEntitiesByName.get(entitySingularName);
	}

	addEntity(dataEntityType:DataEntityType, entity:T):T{
		if (!this._allEntities.has(dataEntityType)) {
			this._allEntities.set(dataEntityType, entity);
			this._allEntitiesByName.set(dataEntityType.name, entity);
		}

		entity.fields = this.getDataEntityTypeFields(dataEntityType);

		// TODO: Clear the fields once the entity is populated, without affecting inherited fields.

		return entity;
	}

	private getDataEntityTypeFields(dataEntityType:DataEntityType):EntityFields{
		if (!dataEntityType)
			return null;

		let parentEntityDataType:DataEntityType = Object.getPrototypeOf(dataEntityType).prototype,
			parentEntity:T = this._allEntities.get(parentEntityDataType),
			parentDataTypeFields:EntityFields = parentEntity && parentEntity.fields || this.getDataEntityTypeFields(parentEntityDataType) || null;

		let fullDataEntityTypeFields:EntityFields = new Map;
		if (parentDataTypeFields)
			parentDataTypeFields.forEach((field:Field, fieldId:string) => fullDataEntityTypeFields.set(fieldId, field));

		let dataEntity:T = this.getEntityByType(dataEntityType);
		let dataEntityTypeFields:EntityFields = dataEntity && dataEntity.fields || entityFieldsService.getDataTypeFields(dataEntityType);

		if (dataEntityTypeFields)
			dataEntityTypeFields.forEach((field:Field, fieldId:string) => fullDataEntityTypeFields.set(fieldId, field));

		return fullDataEntityTypeFields;
	}
}
