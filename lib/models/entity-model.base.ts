import {ModelBase} from "./model.base";
import {EntityField} from "../entity/entity-field.decorator";
import {EntityModelConfigBase} from "./entity-config-base.interface";

export class EntityModelBase extends ModelBase{
	@EntityField()
	id:string;

	get isNew():boolean{
		return this.id === null || this.id === undefined;
	}

	constructor(data:EntityModelConfigBase){
		super(data);
	}
}
