import {Paris} from '../services/paris';
import {ReadonlyRepository} from "./readonly-repository";
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";

describe('ReadonlyRepository', () => {
	let paris: Paris<MockConfigData>,
		todoRepo:ReadonlyRepository<Todo>,
		todoListRepo:ReadonlyRepository<TodoList>;

	beforeEach(() => {
		paris = new Paris({
			data: { version: 2 }
		});
		todoRepo = paris.getRepository(Todo);
		todoListRepo = paris.getRepository(TodoList);
	});

	it('should have the correct endpointName', () => {
		expect(todoRepo.endpointName).toEqual('todo');
	});

	it('should have the correct endpointName (by function)', () => {
		expect(todoListRepo.endpointName).toEqual('v2/list');
	});
});

interface MockConfigData {
	version: number
}
