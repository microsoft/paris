import {ModelBase} from "./model.base";
import {EntityField} from "./decorators/entity-field.decorator";
import {EntityModelConfigBase} from "./entity-config-base.interface";
import {EntityId} from "../modeling/entity-id.type";

export class EntityModelBase<TId extends EntityId = string> extends ModelBase{
	@EntityField()
	id:TId;


	constructor(data:EntityModelConfigBase){
		super(data);
	}
}
