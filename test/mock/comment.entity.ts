import {Entity} from "../../lib/config/decorators/entity.decorator";
import {EntityModelBase} from "../../lib/config/entity-model.base";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";
import {User} from "./user.entity";
import {FIELD_DATA_SELF} from "../../lib/config/entity-field.config";
import {CommentStatus} from "./comment-status.entity";

@Entity({
    singularName: 'Comment',
    pluralName: 'Comments',
    endpoint: 'comments'
})
export class Comment extends EntityModelBase {

    @EntityField()
    comment: string;

    @EntityField({data: FIELD_DATA_SELF})
    commentObject: Object;

    @EntityField()
    CreatedBy: User;

    @EntityField()
    status: CommentStatus;

    @EntityField({arrayOf: User})
    Liked: Array<User>;

}
