import {ModelBase} from "../models/model.base";
import {ValueObject} from "../entity/value-object.decorator";
import {EntityField} from "../entity/entity-field.decorator";

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
