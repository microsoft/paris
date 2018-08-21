import {Paris} from '../services/paris';
import {ReadonlyRepository} from "./readonly-repository";
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";
import {setMockData} from "../mock/mock-data.service";
import {DataQuery} from "../dataset/data-query";
import {DataStoreService} from "../services/data-store.service";
import Mock = jest.Mock;
import {DataEntityType} from "../entity/data-entity.base";
import {ModelEntityCacheConfig} from "../entity/entity.config";

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

	describe('caching', () => {
		setMockData({
			id: 1,
			name: "First list"
		});

		it('returns an item from cache if available', done => {
			todoListRepo.getItemById(1).subscribe(firstTodoList => {
				todoListRepo.getItemById(1).subscribe(secondTodoList => {
					expect(firstTodoList).toBe(secondTodoList);
					done();
				});
			});
		});

		it('returns a new item once cache is expired', done => {
			todoListRepo.getItemById(1).subscribe(firstTodoList => {
				setTimeout(() => {
					todoListRepo.getItemById(1).subscribe(secondTodoList => {
						expect(firstTodoList).not.toBe(secondTodoList);
						done();
					});
				}, (<number>(<ModelEntityCacheConfig>(<DataEntityType<TodoList>>TodoList).entityConfig.cache).time) + 100);
			});
		});
	});
});

interface MockConfigData {
	version: number
}
