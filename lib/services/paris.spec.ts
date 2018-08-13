import { Observable, of } from 'rxjs';
import { DataOptions, defaultDataOptions } from '../dataset/data.options';
import { DataEntityType, DataQuery } from '../main';
import { CreateTodoListApiCall } from '../mock/create-new-list.api-call';
import { Todo } from '../mock/todo.entity';
import { Repository } from '../repository/repository';
import { Http } from './http.service';
import { Paris } from './paris';

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
			expect(paris.getModelBaseConfig(Todo)).toEqual((<DataEntityType>Todo).entityConfig);
		});

		it.skip('should return the valueObjectConfig for a value-object', () => {});
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

	xdescribe('createItem', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it('should call ReadonlyRepository.getModelData with correct params', () => {});

		it('should call ReadonlyRepository.getModelData with correct default params', () => {});

		it('should return an Observable', () => {});
	});

	xdescribe('queryForItem', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it('should call RelationshipRepository.queryForItem with correct params', () => {});

		it('should call RelationshipRepository.queryForItem with correct default params', () => {});

		it("should throw error if repo doesn't exist", () => {});

		it('should return an Observable', () => {});
	});

	xdescribe('getRelatedItem', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it('should call RelationshipRepository.getRelatedItem with correct params', () => {});

		it('should call RelationshipRepository.getRelatedItem with correct default params', () => {});

		it("should throw error if repo doesn't exist", () => {});

		it('should return an Observable', () => {});
	});

	xdescribe('getValue', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it("should return null if repo doesn't exist", () => {});

		it("should return null if repo doesn't have defined values", () => {});

		it("should call valueId if it's a function (predicate)", () => {});

		it('should call getValueById if valueId is not a function', () => {});

		it('should return the correct type', () => {});
	});

	xdescribe('getRelationshipRepository', () => {
		beforeEach(() => {
			paris = new Paris();
		});
		it('should create a RelationshipRepository', () => {});

		it('should return a RelationshipRepository', () => {});
	});
});
