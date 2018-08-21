import {EntityModelBase} from "../models/entity-model.base";
import {Entity} from "../entity/entity.decorator";
import {EntityField} from "../entity/entity-field.decorator";
import {Tag} from "./tag.value-object";

@Entity({
	singularName: "Todo item",
	pluralName: "Todo items",
	endpoint: "todo",
	timeout: 20000
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
}
