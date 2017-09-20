import {Entity} from "../paris/entity/entity.decorator";
import {Identifiable} from "./base/identifiable.model";
import {EntityField} from "../paris/entity/entity-field.decorator";

@Entity({
	singularName: "Tag",
	pluralName: "Tags",
	endpoint: "tags",
	loadAll: true
})
export class TagModel extends Identifiable<string> {
	@EntityField({
		name: "Color"
	})
	color:string;
}
