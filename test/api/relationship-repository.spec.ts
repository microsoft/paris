import {Paris} from '../../lib/paris';
import {TodoListItemsRelationship} from "../mock/todo-list.relationships";
import {setMockData} from "../mock/mock-data.service";
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";
import {Observable} from "rxjs";
import {DataSet} from "../../lib/data_access/dataset";
import {RelationshipRepository} from "../../lib/api/repository/relationship-repository";

describe('RelationshipRepository', () => {
	let paris: Paris<MockConfigData>,
		todoListItemsRepo:RelationshipRepository<TodoList, Todo>,
		getTodoListItems$:Observable<DataSet<Todo>>,
		sourceTodoList:TodoList;

	setMockData({
		items: [
			{
				id: 1,
				text: 'First'
			},
			{
				id: 2,
				text: 'Second'
			}
		]
	});

	beforeEach(() => {
		paris = new Paris({
			data: { version: 2 }
		});
		sourceTodoList = new TodoList({ id: 1 });
		todoListItemsRepo = paris.getRelationshipRepository(TodoListItemsRelationship);
		getTodoListItems$ = paris.queryForItem(TodoListItemsRelationship, sourceTodoList);
	});

	it('should return a DataSet of Todo for the TodoList', done => {
		getTodoListItems$.subscribe(itemsDataSet => {
			expect(itemsDataSet.items.every(item => item instanceof Todo)).toBe(true);
			done();
		});
	});

	describe('getEndpointUrl', () => {
		it('should return the endpoint URL when no baseUrl was defined', () => {
			todoListItemsRepo.sourceItem = sourceTodoList;
			expect(todoListItemsRepo.getEndpointUrl({ where: { todoListId: 1 }})).toBe('/lists/1/items');
		});
	});
});
