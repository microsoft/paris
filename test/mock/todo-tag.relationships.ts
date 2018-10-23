import {Todo} from "./todo.entity";
import {EntityRelationship} from "../../lib/config/decorators/entity-relationship.decorator";
import {ParisConfig} from "../../lib/config/paris-config";
import {DataQuery} from "../../lib/data_access/data-query";
import {RelationshipType} from "../../lib/config/relationship-type.enum";
import {EntityRelationshipRepositoryType} from "../../lib/api/entity/entity-relationship-repository-type";
import {Tag} from "./tag.value-object";

@EntityRelationship({
	sourceEntity: Todo,
	dataEntity: Tag,
	endpoint: (config: ParisConfig<MockConfigData>, query: DataQuery) => `todo/tag/${(<any>query.where).todo}`,
	foreignKey: 'todo',
	allowedTypes: [RelationshipType.OneToOne],
	parseData: data => ({ ...data, colorName: 'Purple' })
})
export class TodoTagRelationship implements EntityRelationshipRepositoryType<Todo, Tag> {}
