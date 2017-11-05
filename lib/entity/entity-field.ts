import {DataEntityType} from "./data-entity.base";

export interface Field{
	id?:string,
	name?:string,
	data?:"__self" | string | Array<string>,
	entity?:DataEntityType,
	type?:DataEntityType,
	defaultValue?:any,
	arrayOf?:DataEntityType,
	isArray?:boolean,
	required?:boolean
}

export const FIELD_DATA_SELF = "__self";
