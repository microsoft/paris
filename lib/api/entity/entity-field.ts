import {FieldConfig} from "../../config/entity-field.config";
import {DataEntityType} from "./data-entity.base";

export interface Field extends FieldConfig{
	entity?:DataEntityType,
	type?:Function,
	isArray?:boolean,
}
