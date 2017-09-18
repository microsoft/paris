import {EntityFields} from "./entity-fields";

export class ModelEntity{
	singularName:string;
	pluralName:string;
	endpoint:string;
	fields?:EntityFields;
	loadAll?:boolean = false;
	listOf?:any;

	constructor(config:ModelEntityConfig){
		Object.assign(this, config);
	}
}

export interface ModelEntityConfig{
	singularName:string,
	pluralName:string,
	endpoint:string,
	loadAll?:boolean,
	listOf?:any
}
