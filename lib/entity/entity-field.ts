import {DataEntityType} from "./data-entity.base";
import {ParisConfig} from "../config/paris-config";

export interface Field{
	id?:string,
	name?:string,
	data?:"__self" | string | Array<string>,
	entity?:DataEntityType,
	type?:DataEntityType,
	defaultValue?:any,
	arrayOf?:DataEntityType,
	isArray?:boolean,
	required?:boolean,
	require?:EntityFieldConfigFunctionOrValue
}

export const FIELD_DATA_SELF = "__self";
export type EntityFieldConfigFunctionOrValue = ((data:any, config?:ParisConfig) => string) | string;
