import {EntityModelBase} from "../../lib/config/entity-model.base";
import {Entity} from "../../lib/config/decorators/entity.decorator";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";
import {Tag} from "./tag.value-object";
import {TodoStatus} from "./todo-status.entity";

@Entity({
	singularName: "Todo item",
	pluralName: "Todo items",
	endpoint: "todo",
	timeout: 20000,
	customHeaders: ((data, config) => data.name === 'test' ? ({'testCaseHeader': 'testCaseValue'}) : {'notTestCaseHeader': 'notTestCaseValue'})
})
export class Todo extends EntityModelBase<number>{
	@EntityField()
	text:string;

	@EntityField()
	time:Date;

	@EntityField({ arrayOf: Tag })
	tags:Array<Tag>;

	@EntityField({ defaultValue: false })
	isDone:boolean;

	@EntityField()
	status:TodoStatus;
}
