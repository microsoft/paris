import {Entity} from "../paris/entity/entity.decorator";
import {EntityField} from "../paris/entity/entity-field.decorator";
import {EntityBaseModel} from "./base/entity-base.model";

@Entity({
	singularName: "Tag",
	pluralName: "Tags",
	endpoint: "tags",
	loadAll: true
})
export class TagModel extends EntityBaseModel {
	@EntityField({
		name: "Color"
	})
	color:string;
}
