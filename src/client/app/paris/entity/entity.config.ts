import {EntityFields} from "./entity-fields";
import {Field} from "./entity-field";

export class ModelEntity{
	singularName:string;
	pluralName:string;
	endpoint:string;
	fields?:EntityFields;
	loadAll?:boolean = false;
	listOf?:any;
	cache?:ModelEntityCacheConfig;

	get fieldsArray():Array<Field>{
		return this.fields ? Array.from(this.fields.values()) : [];
	}

	constructor(config:ModelEntityConfig){
		Object.assign(this, config);
	}
}

export interface ModelEntityConfig{
	singularName:string,
	pluralName:string,
	endpoint:string,
	loadAll?:boolean,
	listOf?:any,
	cache?: ModelEntityCacheConfig
}

interface ModelEntityCacheConfig{
	time?: number,
	max?: number
}
