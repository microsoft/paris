import {Field} from "./entity-field";

export class ModelEntity{
	singularName:string;
	pluralName:string;
	endpoint:string;
	fields?:Array<Field> = [];
	loadAll?:boolean = false;

	constructor(config:ModelEntityConfig){
		Object.assign(this, config);
	}
}

export interface ModelEntityConfig{
	singularName:string,
	pluralName:string,
	endpoint:string,
	loadAll?:boolean
}
