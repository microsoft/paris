import {EntityRelationship} from "../entity/entity-relationship.decorator";
import {DataQuery} from "../dataset/data-query";
import {RelationshipType} from "../models/relationship-type.enum";
import {EntityRelationshipRepositoryType} from "../entity/entity-relationship-repository-type";
import {TodoList} from "./todo-list.entity";
import {Todo} from "./todo.entity";
import {ParisConfig} from "../config/paris-config";

@EntityRelationship({
	sourceEntity: TodoList,
	dataEntity: Todo,
	endpoint: (config: ParisConfig<MockConfigData>, query: DataQuery) => `lists/${(<any>query.where).todoListId}/items`,
	foreignKey: 'listId',
	allowedTypes: [RelationshipType.OneToMany],
})
export class TodoListItemsRelationship implements EntityRelationshipRepositoryType<TodoList, Todo> {}
