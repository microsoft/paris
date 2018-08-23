import {Observable, of} from 'rxjs';
import {CreateTodoListApiCall} from './mock/create-new-list.api-call';
import {Todo} from './mock/todo.entity';
import {Repository} from '../lib/api/repository/repository';
import {Http} from '../lib/data_access/http.service';
import {Paris} from '../lib/paris';
import {Tag} from "./mock/tag.value-object";
import {DataOptions, defaultDataOptions} from "../lib/data_access/data.options";
import {DataEntityType} from "../lib/api/entity/data-entity.base";
import {DataQuery} from "../lib/data_access/data-query";
import {TodoStatus} from "./mock/todo-status.entity";
import {TodoListItemsRelationship} from "./mock/todo-list.relationships";
import {RelationshipRepository} from "../lib/api/repository/relationship-repository";
import {TodoList} from "./mock/todo-list.entity";

describe('Paris main', () => {
	let paris: Paris;

	describe('Get Todo repository', () => {
		let repo: Repository<Todo>;

		beforeEach(() => {
			paris = new Paris();
			repo = paris.getRepository(Todo);
		});

		it('should create a ToDo repository', () => {
			expect(repo).toBeDefined();
		});

		it('should return a Repository from getRepository', () => {
			expect(repo).toBeInstanceOf(Repository);
		});

		it.skip("should return null if entity doesn't exist", () => {});
	});

	describe('Get Todo item by ID', () => {
		let repo: Repository<Todo>, item$: Observable<Todo>;
		let httpRequestSpy: jest.SpyInstance<Http>;

		beforeAll(() => {
			httpRequestSpy = jest.spyOn(Http, 'request');
		});

		afterAll(() => {
			httpRequestSpy.mockRestore();
		});

		beforeEach(() => {
			paris = new Paris();
			repo = paris.getRepository(Todo);

			jest.spyOn(repo, 'getItemById');
			jest.spyOn(paris.dataStore, 'request');
			item$ = paris.getItemById(Todo, 1);
		});

		it('should call Repository.getItemById with correct default params', () => {
			expect(repo.getItemById).toHaveBeenCalledWith(1, defaultDataOptions, undefined);
		});

		it('should call Http.request with correct default params', () => {
			expect(Http.request).toHaveBeenCalledWith('GET', '/todo/1', undefined, {
				timeout: 20000,
			});
		});

		it('should call Repository.getItemById with correct params', () => {
			paris.getItemById(Todo, 1, null, { test: 1 });
			expect(repo.getItemById).toHaveBeenCalledWith(1, defaultDataOptions, { test: 1 });
		});

		it('should call Http.request with correct params', () => {
			expect(Http.request).toHaveBeenCalledWith(
				'GET',
				'/todo/1',
				{ params: { test: 1 } },
				{ timeout: 20000 }
			);
		});

		it('should return an Observable from paris.getItemById', () => {
			expect(item$).toBeInstanceOf(Observable);
		});

		it.skip('should throw error if getItem is not supported', () => {});

		it('should call datastore.request', () => {
			expect(paris.dataStore.request).toHaveBeenCalled();
		});
	});

	describe('getModelBaseConfig', () => {
		beforeEach(() => {
			paris = new Paris();
		});

		it('should return the entityConfig for Todo', () => {
			expect(paris.getModelBaseConfig(Todo)).toBe((<DataEntityType>Todo).entityConfig);
		});

		it('should return the valueObjectConfig for a ValueObject', () => {
			expect(paris.getModelBaseConfig(Tag)).toBe((<DataEntityType>Tag).valueObjectConfig);
		});
	});

	describe('query', () => {
		let repo: Repository<Todo>;

		beforeEach(() => {
			paris = new Paris();
			repo = paris.getRepository(Todo);
			jest.spyOn(repo, 'query');
		});

		it('should call Repository.query with correct default params', () => {
			paris.query(Todo);
			expect(repo.query).toHaveBeenCalledWith(undefined, defaultDataOptions);
		});

		it('should call Repository.query with correct params', () => {
			const query: DataQuery = { where: { a: 1 } },
				dataOptions: DataOptions = { allowCache: false };
			paris.query(Todo, query, dataOptions);
			expect(repo.query).toHaveBeenCalledWith(query, dataOptions);
		});

		it('should return an Observable from paris.query', () => {
			expect(paris.query(Todo)).toBeInstanceOf(Observable);
		});

		it("should throw error if repo doesn't exist", () => {
			expect(() => paris.query(<any>String)).toThrow();
		});
	});

	describe('apiCall', () => {
		let httpRequestSpy: jest.SpyInstance<Http>;
		let jestGetApiCallCacheSpy: jest.SpyInstance<Paris>;
		let jestMakeApiCallSpy: jest.SpyInstance<Paris>;

		beforeAll(() => {
			httpRequestSpy = jest.spyOn(Http, 'request');
		});

		afterAll(() => {
			httpRequestSpy.mockRestore();
		});

		beforeEach(() => {
			paris = new Paris();

			jestGetApiCallCacheSpy = jest.spyOn(paris, 'getApiCallCache' as any);
			jestMakeApiCallSpy = jest.spyOn(paris, 'makeApiCall' as any);
		});

		it.skip('should add data to cache if configured to', () => {
			// TODO: we need to subscribe in order for this to work
		});

		it('should get data from cache if available and configured to', () => {
			jestGetApiCallCacheSpy.mockRestore();
			const fakeCache = { get: () => of(null) };
			jest.spyOn(fakeCache, 'get');
			paris['getApiCallCache'] = jest.fn(() => fakeCache);

			paris.apiCall(CreateTodoListApiCall);
			expect((<any>paris).makeApiCall).not.toHaveBeenCalled();
			expect(Http.request).not.toHaveBeenCalled();
			expect(fakeCache.get).toHaveBeenCalled();
		});

		it('should not get data from cache if allowCache is false', () => {
			paris.apiCall(CreateTodoListApiCall, undefined, { allowCache: false });
			expect((<any>paris).getApiCallCache).not.toHaveBeenCalled();
		});

		it('should always add newer data to cache if cache exists', () => {});

		it('should not cache null/undefined values', () => {});

		it('should call makeApiCall with correct params', () => {});

		it('should call makeApiCall with correct default params', () => {});

		it('should emit from error$ if encountered an error', () => {});

		it('should call modelArray if repo exists data is array', () => {});

		it('should call createItem if repo exists and data is not an array', () => {});

		it("should call DataTransformersService.parse if repo doesn't exist and data type is defined", () => {});

		it('should call parse if defined', () => {});

		it('should return an Observable', () => {});

		it('should throw an error if no endpoint is configured', () => {});

		it('should throw an error if no endpoint is configured', () => {});

		it.skip('should call datastore.request', () => {
			expect(paris.dataStore.request).toHaveBeenCalled();
		});

		it('should call Http.request with correct default params', () => {});

		it('should call Http.request with correct params', () => {});
	});

	describe('callQuery', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it('should call makeApiCall with correct params', () => {});

		it('should call makeApiCall with correct default params', () => {});

		it('should call rawDataToDataSet with correct params', () => {});

		it('should emit from error$ if encountered an error', () => {});

		it('should return an Observable', () => {});

		it.skip('should call datastore.request', () => {
			expect(paris.dataStore.request).toHaveBeenCalled();
		});

		it('should call Http.request with correct default params', () => {});

		it('should call Http.request with correct params', () => {});
	});

	describe('createItem', () => {
		let createItem$:Observable<Todo>;

		beforeEach(() => {
			paris = new Paris();
			createItem$ = paris.createItem<Todo>(Todo, { id: 1, text: 'test' });
		});

		it('should return an Observable', () => {
			expect(createItem$).toBeInstanceOf(Observable);
		});

		it('should create a Todo item', done => {
			createItem$.subscribe(todo => {
				expect(todo).toBeInstanceOf(Todo);
				done();
			});
		});
	});

	describe('queryForItem', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it('should call RelationshipRepository.queryForItem with correct params', () => {});

		it('should call RelationshipRepository.queryForItem with correct default params', () => {});

		it("should throw error if repo doesn't exist", () => {
			expect(() => paris.queryForItem(TodoList, new Todo({ id: 1 }))).toThrow();
		});

		it('should return an Observable', () => {});
	});

	describe('getRelatedItem', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it('should call RelationshipRepository.getRelatedItem with correct params', () => {});

		it('should call RelationshipRepository.getRelatedItem with correct default params', () => {});

		it("should throw error if the relationship repository doesn't exist", () => {
			expect(() => paris.getRelatedItem(TodoList, new Todo({ id: 1 }))).toThrow();
		});

		it("should throw an error if the relationship doesn't support OneToMany", () => {
			expect(() => paris.getRelatedItem(TodoListItemsRelationship, new TodoList({ id: 1 }))).toThrow();
		});

		it("should return an Observable", () => {
			expect(paris.queryForItem(TodoListItemsRelationship, new TodoList({ id: 1 }))).toBeInstanceOf(Observable);
		});
	});

	describe('getValue', () => {
		beforeEach(() => {
			paris = new Paris();
		});

		it("should return null if repo doesn't exist", () => {
			class SomeClass{}
			expect(paris.getValue(SomeClass, 1)).toBe(null);
		});

		it("should return null if repo doesn't have defined values", () => {
			expect(paris.getValue(TodoStatus, 9)).toBe(null);
		});

		it("should call valueId if it's a function (predicate)", () => {
			expect(paris.getValue(TodoStatus, status => /done/i.test(status.name)).name).toBe('Done');
		});

		it('should call getValueById if valueId is not a function', () => {
			expect(paris.getValue(TodoStatus, 1).name).toBe('Open');
		});

		it('should return the correct type', () => {
			expect(paris.getValue(TodoStatus, 1)).toBeInstanceOf(TodoStatus);
		});
	});

	describe('getRelationshipRepository', () => {
		beforeEach(() => {
			paris = new Paris();
		});

		it('should create a RelationshipRepository', () => {
			expect(paris.getRelationshipRepository(TodoListItemsRelationship)).toBeDefined();
		});

		it('should return a RelationshipRepository', () => {
			expect(paris.getRelationshipRepository(TodoListItemsRelationship)).toBeInstanceOf(RelationshipRepository);
		});
	});
});
