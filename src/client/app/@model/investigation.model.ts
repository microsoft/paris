import {Identifiable} from "./base/identifiable.model";
import {MachineModel} from "./machine.model";
import {Entity} from "../paris/entity/entity.decorator";
import {EntityField} from "../paris/entity/entity-field.decorator";
import {AlertModel} from "./alert.model";

@Entity({
	singularName: "Investigation",
	pluralName: "Investigation",
	endpoint: "investigations"
})
export class InvestigationModel extends Identifiable<number>{
	@EntityField({
		name: "Machines"
	})
	machines:Array<MachineModel>;

	@EntityField({
		name: "Alert"
	})
	alert:AlertModel;
}
