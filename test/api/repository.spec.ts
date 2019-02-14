import {Paris} from '../../lib/paris';
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";
import {Repository} from "../../lib/api/repository/repository";
import {of} from "rxjs";
import {Tag} from "../mock/tag.value-object";
import {DataStoreService} from "../../lib/data_access/data-store.service";
import {TodoListState} from "../mock/todo-list-state.value-object";

describe('Repository', () => {
	let paris: Paris<MockConfigData>,
		todoRepo:Repository<Todo>,
		todoListRepo:Repository<TodoList>,
		newTodoItem:Todo,
		newTodoList:TodoList;

	beforeEach(() => {
		paris = new Paris({
			data: { version: 2 }
		});
		todoRepo = paris.getRepository(Todo);
		todoListRepo = paris.getRepository(TodoList);

		newTodoItem = new Todo({
			id: undefined,
			text: 'New todo item',
			tags: [
				{ text: 'testing', color: '#abcdefg' },
				{ text: 'success' },
			].map(tag => new Tag(tag))
		});

		newTodoList = new TodoList({
			id: undefined,
			name: 'New todo list',
			state: new TodoListState({
				isDone: false,
				isShared: false
			})
		});
	});

	describe('save an item', () => {
		let errorCallback:jest.Mock;

		beforeEach(() => {
			errorCallback = jest.fn();
			DataStoreService.prototype.save = jest.fn(() => of(newTodoItem) as any);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it ("saves an item", done => {
			todoRepo.save(newTodoItem).subscribe(
				() => done(),
				errorCallback
			);

			expect(errorCallback).not.toBeCalled();
		});

		it ("saves an different item", done => {
			todoListRepo.save(newTodoList).subscribe(
				() => done(),
				errorCallback
			);

			expect(errorCallback).not.toBeCalled();
		});
	});
});

interface MockConfigData {
	version: number
}
