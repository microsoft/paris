import {ModelBase} from "../../lib/config/model.base";
import {ValueObject} from "../../lib/config/decorators/value-object.decorator";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";

@ValueObject({
	singularName: 'Tag',
	pluralName: 'Tags',
	readonly: true
})
export class Tag extends ModelBase{
	@EntityField()
	text: string;

	@EntityField({ data: ['colorHexa', 'colorName'], defaultValue: 'Blue' })
	color?:string;
}
