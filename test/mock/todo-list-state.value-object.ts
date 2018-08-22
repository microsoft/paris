import {ModelBase} from "../../lib/config/model.base";
import {ValueObject} from "../../lib/config/decorators/value-object.decorator";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";

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
