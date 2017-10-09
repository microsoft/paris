import {EntityBaseModel} from "../base/entity-base.model";
import {ObjectValue} from "../../paris/entity/object-value.decorator";
import {itemStatusValues} from "./item-status.values";
import {EntityField} from "../../paris/entity/entity-field.decorator";

@ObjectValue({
	singularName: "Item Status",
	pluralName: "Item Statuses",
	values: itemStatusValues
})
export class ItemStatusModel extends EntityBaseModel {
	@EntityField({
		name: "Name"
	})
	name:string;
}
