import {EntityField} from "../../paris/entity/entity-field.decorator";
import {IIdentifiable} from "../../paris/models/identifiable.model";

export abstract class EntityBaseModel implements IIdentifiable{
	@EntityField({
		name: "ID"
	})
	$key:string;

	get isNew():boolean{
		return this.$key === null || this.$key === undefined;
	}

	constructor(data?:EntityBaseData){
		if (data)
			Object.assign(this, data);
	}
}

interface EntityBaseData extends IIdentifiable{
	[key:string]:any
}
