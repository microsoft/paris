import {ModelBase} from "../models/model.base";
import {ValueObject} from "../entity/value-object.decorator";
import {EntityField} from "../entity/entity-field.decorator";

@ValueObject({
	singularName: 'Todo list state',
	pluralName: 'Todo list states'
})
export class TodoListState extends ModelBase{
	@EntityField({ defaultValue: false })
	isDone:boolean;

	@EntityField({ defaultValue: false })
	isShared:boolean;

}
