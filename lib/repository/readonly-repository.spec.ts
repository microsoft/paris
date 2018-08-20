import {Paris} from '../services/paris';
import {ReadonlyRepository} from "./readonly-repository";
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";
import {setMockData} from "../mock/mock-data.service";
import {DataQuery} from "../dataset/data-query";

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

	describe('endpointName', () => {
		it('should have the correct endpointName', () => {
			expect(todoRepo.endpointName).toEqual('todo');
		});

		it('should have the correct endpointName (by function)', () => {
			expect(todoListRepo.endpointName).toEqual('v2/list');
		});
	});

	describe('queryItem', () => {
		let jestGetQueryHttpOptionsSpy: jest.SpyInstance<ReadonlyRepository<TodoList>>,
			query:DataQuery;

		setMockData({
			id: 1,
			name: "First list"
		});

		beforeEach(() => {
			query = { where: { containsItem: 2 }};
			jestGetQueryHttpOptionsSpy = jest.spyOn(todoListRepo, 'getQueryHttpOptions' as any);
		});

		it('queries for an item', done => {
			todoListRepo.queryItem(query).subscribe(todoList => {
				expect(todoList).toBeInstanceOf(TodoList);
				done();
			});
		});

		it('creates HttpOptions with the passed DataQuery', done => {
			todoListRepo.queryItem(query).subscribe(todoList => {});
			expect(jestGetQueryHttpOptionsSpy).toHaveBeenCalledWith(query);
			jestGetQueryHttpOptionsSpy.mockRestore();
			done();
		});
	});
});

interface MockConfigData {
	version: number
}
