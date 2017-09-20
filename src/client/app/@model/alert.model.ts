import {Entity} from "../paris/entity/entity.decorator";
import {Identifiable} from "./base/identifiable.model";
import {EntityField} from "../paris/entity/entity-field.decorator";
import {MachineModel} from "./machine.model";
import {AlertStatusModel} from "./alert-status.model";
import {TagModel} from "./tag.model";

@Entity({
	singularName: "Alert",
	pluralName: "Alerts",
	endpoint: "alerts"
})
export class AlertModel extends Identifiable<string> {
	@EntityField({
		name: "Name",
		data: "title"
	})
	name?: string;

	@EntityField({
		name: "Status"
	})
	status:AlertStatusModel;

	@EntityField({
		name: "Machine"
	})
	machine?:MachineModel;

	@EntityField({
		name: "Host"
	})
	host?:MachineModel;

	@EntityField({
		name: "Date"
	})
	date:Date;

	@EntityField({
		name: "Tags",
		genericType: TagModel
	})
	tags:Array<TagModel>;
}
