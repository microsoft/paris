import {Paris} from '../../lib/paris';
import {TodoListItemsRelationship} from "../mock/todo-list.relationships";
import {setMockData} from "../mock/mock-data.service";
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";
import {Observable} from "rxjs";
import {DataSet} from "../../lib/data_access/dataset";

describe('RelationshipRepository', () => {
	let paris: Paris<MockConfigData>,
		todoListItemsRepo:TodoListItemsRelationship,
		getTodoListItems$:Observable<DataSet<Todo>>;

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
		todoListItemsRepo = paris.getRelationshipRepository(TodoListItemsRelationship);
		getTodoListItems$ = paris.queryForItem(TodoListItemsRelationship, new TodoList({ id: 1 }))
	});

	it('should return a DataSet of Todo for the TodoList', done => {
		getTodoListItems$.subscribe(itemsDataSet => {
			expect(itemsDataSet.items.every(item => item instanceof Todo)).toBe(true);
			done();
		});
	});
});
