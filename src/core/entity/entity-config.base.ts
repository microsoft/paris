import {EntityFields} from "./entity-fields";
import {Field} from "./entity-field";

export abstract class EntityConfigBase{
	singularName:string;
	pluralName:string;
	fields?:EntityFields;
	idProperty?:string;

	get fieldsArray():Array<Field>{
		return this.fields ? Array.from(this.fields.values()) : [];
	}

	constructor(config:IEntityConfigBase){
		Object.assign(this, config);
	}
}

export interface IEntityConfigBase{
	singularName:string,
	pluralName:string,
	fields?:EntityFields,
	idProperty?:string,
}
