import {EntityBaseModel} from "./base/entity-base.model";
import {TagModel} from "./tag.model";
import {EntityField} from "../paris/entity/entity-field.decorator";
import {UserModel} from "./user.model";
import {Entity} from "../paris/entity/entity.decorator";

@Entity({
	singularName: "Todo Item",
	pluralName: "Todo Items",
	endpoint: "todo"
})
export class TodoItemModel extends EntityBaseModel{
	@EntityField({
		name: "Text"
	})
	text:string;

	@EntityField({
		name: "Tags",
		arrayOf: TagModel
	})
	tags:Array<TagModel>;

	@EntityField({
		name: "Created On"
	})
	created:Date;

	@EntityField({
		name: "Is Done",
		defaultValue: false
	})
	isDone:boolean;

	@EntityField({
		name: "Done On"
	})
	doneTime:Date;

	@EntityField({
		name: "User"
	})
	user:UserModel;
}
