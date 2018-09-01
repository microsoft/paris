import {TodoList} from "./todo-list.entity";
import {Todo} from "./todo.entity";
import {EntityRelationship} from "../../lib/config/decorators/entity-relationship.decorator";
import {ParisConfig} from "../../lib/config/paris-config";
import {DataQuery} from "../../lib/data_access/data-query";
import {RelationshipType} from "../../lib/config/relationship-type.enum";
import {EntityRelationshipRepositoryType} from "../../lib/api/entity/entity-relationship-repository-type";

@EntityRelationship({
	sourceEntity: TodoList,
	dataEntity: Todo,
	endpoint: (config: ParisConfig<MockConfigData>, query: DataQuery) => `lists/${(<any>query.where).todoListId}/items`,
	foreignKey: 'listId',
	allowedTypes: [RelationshipType.OneToMany],
})
export class TodoListItemsRelationship implements EntityRelationshipRepositoryType<TodoList, Todo> {}
