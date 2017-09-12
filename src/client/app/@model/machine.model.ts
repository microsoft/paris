import {Identifiable} from "./base/identifiable.model";
import {Entity} from "../paris/entity/entity.decorator";
import {EntityField} from "../paris/entity/entity-field.decorator";

@Entity({
	singularName: "Machine",
	pluralName: "Machines",
	endpoint: "machines"
})
export class MachineModel extends Identifiable<string> {
	@EntityField({
		name: "Domain"
	})
	domain:string;
}
