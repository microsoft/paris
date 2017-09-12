import {Entity} from "../paris/entity/entity.decorator";
import {Identifiable} from "./base/identifiable.model";
import {EntityField} from "../paris/entity/entity-field.decorator";

@Entity({
	singularName: "Alert Status",
	pluralName: "Alert Statuses",
	endpoint: "alerts/status",
	loadAll: true
})
export class AlertStatusModel extends Identifiable<number> {
	@EntityField({
		name: "Category"
	})
	category:string;
}
