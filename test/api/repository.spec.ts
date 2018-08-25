import {Paris} from '../../lib/paris';
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";
import {Repository} from "../../lib/api/repository/repository";

describe('Repository', () => {
	let paris: Paris<MockConfigData>,
		todoRepo:Repository<Todo>,
		todoListRepo:Repository<TodoList>,
		newTodoItem:Todo;

	beforeEach(() => {
		paris = new Paris({
			data: { version: 2 }
		});
		todoRepo = paris.getRepository(Todo);
		todoListRepo = paris.getRepository(TodoList);
		newTodoItem = new Todo({ id: undefined, text: 'New todo item' });
	});

	describe('save an item', () => {
		it ("doesn't throw when trying to save an item", () => {
			expect(() => todoRepo.save(newTodoItem)).not.toThrow();
		});
	});
});

interface MockConfigData {
	version: number
}
