import {EntityBaseModel} from "./base/entity-base.model";
import {EntityField} from "../paris/entity/entity-field.decorator";
import {Entity} from "../paris/entity/entity.decorator";

@Entity({
	singularName: "User",
	pluralName: "Users",
	endpoint: "users",
	cache: {
		time: 1000 * 60 * 60
	}
})
export class UserModel extends EntityBaseModel{
	@EntityField({
		name: "Name"
	})
	name:string;
}
