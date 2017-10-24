import {EntityField} from "../../paris/entity/entity-field.decorator";
import {IIdentifiable} from "../../paris/models/identifiable.model";

export abstract class EntityBaseModel implements IIdentifiable{
	@EntityField({
		name: "ID"
	})
	id:string;

	get isNew():boolean{
		return this.id === null || this.id === undefined;
	}

	constructor(data?:EntityBaseData){
		if (data)
			Object.assign(this, data);
	}
}

interface EntityBaseData extends IIdentifiable{
	[key:string]:any
}
