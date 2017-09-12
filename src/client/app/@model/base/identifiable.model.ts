import {EntityField} from "../../paris/entity/entity-field.decorator";
import {IIdentifiable} from "../../paris/models/identifiable.model";

export abstract class Identifiable<T extends string | number> implements IIdentifiable{
	@EntityField({
		name: "ID"
	})
	id:T;

	@EntityField({
		name: "Name"
	})
	name?:string;

	constructor(data:IdentifiableData<T>){
		Object.assign(this, data);
	}
}

export interface IdentifiableData<T extends string | number>{
	id:T,
	name?:string
}
