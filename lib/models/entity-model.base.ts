import {ModelBase} from "./model.base";
import {EntityField} from "../entity/entity-field.decorator";
import {EntityModelConfigBase} from "./entity-config-base.interface";

export class EntityModelBase<T extends number|string = string> extends ModelBase{
	@EntityField()
	id:T;

	constructor(data:EntityModelConfigBase){
		super(data);
	}
}
