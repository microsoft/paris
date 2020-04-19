import {Paris} from '../../lib/paris';
import {ReadonlyRepository} from "../../lib/api/repository/readonly-repository";
import {Todo} from "../mock/todo.entity";
import {TodoList} from "../mock/todo-list.entity";
import {setMockData} from "../mock/mock-data.service";
import {DataEntityType} from "../../lib/api/entity/data-entity.base";
import {ModelEntityCacheConfig} from "../../lib/config/entity.config";
import {DataQuery} from "../../lib/data_access/data-query";
import {TodoStatus, todoStatusValues} from "../mock/todo-status.entity";

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

	describe('getEndpointUrl', () => {
		it('should return the endpoint URL when no baseUrl was defined', () => {
			expect(todoRepo.getEndpointUrl()).toBe('/todo');
		});

		it('should have the correct endpointName (by function)', () => {
			expect(todoListRepo.getEndpointUrl()).toEqual('/v2/list');
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

	describe('getQueryHttpOptions', () => {
		it ('sends the separateArrayParams defined in the entity backend config', () => {
			const queryHttpOptions = todoRepo.getQueryHttpOptions({ where: { params: { foo: 'bar' } }});
			expect(queryHttpOptions.separateArrayParams).toBe(true);
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

	describe('values', () => {
		let todoStatusRepo:ReadonlyRepository<TodoStatus>;

		beforeEach(() => {
			todoStatusRepo = paris.getRepository(TodoStatus);
		});

		it ('exposes the configured values', () => {
			expect(todoStatusRepo.values).toEqual(todoStatusValues);
		});
	});

	describe('createNewItem', () => {
		it('should set fields to default values if no value is supplied and a default is available', () => {
			const todo = paris.getRepository(Todo).createNewItem();
			expect(todo.extraData).toEqual((<DataEntityType<Todo>>Todo).entityConfig.fields.get('extraData').defaultValue);
		});

		it('should deep clone default values before adding them to the model', () => {
			const todo = paris.getRepository(Todo).createNewItem();
			expect(todo.extraData).not.toBe((<DataEntityType<Todo>>Todo).entityConfig.fields.get('extraData').defaultValue);
			expect(todo.extraData.attachments).not.toBe((<DataEntityType<Todo>>Todo).entityConfig.fields.get('extraData').defaultValue.attachments);
		});
	});

	describe('parseData', () => {
		const text = "testParseData";
		it('should set parse the raw data according to the original response', () => {
			setMockData({
				isDataObject: true,
				dataObject: {
					id: 1,
					text: text
				}
			});
			todoRepo.getItemById(1).subscribe(todoItem => {
				expect(todoItem.text).toEqual(text)
			});
		});

		it('should set parse the raw data according to the query', () => {
			setMockData({
				dataObject: {
					id: 1,
					text: text
				}
			});
			todoRepo.getItemById(1, undefined, {isDataObject: true}).subscribe(todoItem => {
				expect(todoItem.text).toEqual(text)
			});
		});
	});
});

interface MockConfigData {
	version: number
}
