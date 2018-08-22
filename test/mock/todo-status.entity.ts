import {Entity} from "../../lib/config/decorators/entity.decorator";
import {EntityModelBase} from "../../lib/config/entity-model.base";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";

export const todoStatusValues = [
	{ id: 1, name: "Open" },
	{ id: 2, name: "In progress" },
	{ id: 3, name: "Done" },
];

@Entity({
	singularName: "Todo status",
	pluralName: "Todo statuses",
	values: todoStatusValues
})
export class TodoStatus extends EntityModelBase<number>{
	@EntityField() name:string;
}

