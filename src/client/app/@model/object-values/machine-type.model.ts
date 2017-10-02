import {Identifiable} from "../base/identifiable.model";
import {machineTypeValues} from "./machine-type.values";
import {ObjectValue} from "../../paris/entity/object-value.decorator";
import {EntityField} from "../../paris/entity/entity-field.decorator";

@ObjectValue({
	singularName: "Machine Type",
	pluralName: "Machine Types",
	values: machineTypeValues
})
export class MachineTypeModel extends Identifiable<number>{
	@EntityField({
		name: "ClassName"
	})
	className:string;
}
