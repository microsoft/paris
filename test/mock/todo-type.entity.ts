import { EntityModelBase } from '../../lib/config/entity-model.base';
import { Entity } from '../../lib/config/decorators/entity.decorator';
import { EntityField } from '../../lib/config/decorators/entity-field.decorator';

@Entity({
	singularName: "Todo type",
	pluralName: "Todo types",
	endpoint: "types",
	loadAll: true,
	readonly: true
})
export class TodoType extends EntityModelBase<number> {
	@EntityField() name: string;
}
