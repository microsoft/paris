import {Entity} from "../../lib/config/decorators/entity.decorator";
import {EntityModelBase} from "../../lib/config/entity-model.base";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";

export const commentStatusValues = [
    {id: 0, name: 'Approved'},
    {id: 1, name: 'Rejected'},
    {id: 2, name: 'PENDING'},
];

@Entity({
    singularName: "Comment status",
    pluralName: "Comment statuses",
    values: commentStatusValues
})
export class CommentStatus extends EntityModelBase<number> {
    @EntityField() name: string;
}

