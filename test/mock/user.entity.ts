import {Entity} from "../../lib/config/decorators/entity.decorator";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";
import {EntityModelBase} from "../../lib/main";

export enum UserType {
    ADMIN = "ADMIN",
    USER = "USER",
}

@Entity({
    singularName: 'User',
    pluralName: 'Users',
    endpoint: 'users',
    readonly: true,
})
export class User extends EntityModelBase {

    @EntityField({data: ["username"]})
    name: string;

    @EntityField()
    Age: number;

    @EntityField({required: false, arrayOf: String})
    nickNames?: Array<string>;

    @EntityField({data: "address", parse: (fieldData) => fieldData.city})
    city: string;

    @EntityField({type: UserType, defaultValue: UserType.USER})
    USER_TYPE?: UserType;

}
