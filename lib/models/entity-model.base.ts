import {ModelBase} from "./model.base";
import {EntityField} from "../entity/entity-field.decorator";
import {EntityModelConfigBase} from "./entity-config-base.interface";
import {EntityId} from "./entity-id.type";

export class EntityModelBase<TId extends EntityId = string> extends ModelBase{
	@EntityField()
	id:TId;

	constructor(data:EntityModelConfigBase){
		super(data);
	}
}
