import {ModelBase} from "./model.base";
import {EntityField} from "../entity/entity-field.decorator";
import {EntityModelConfigBase} from "./entity-config-base.interface";

export class EntityModelBase extends ModelBase{
	@EntityField()
	id:string|number;

	constructor(data:EntityModelConfigBase){
		super(data);
	}
}
