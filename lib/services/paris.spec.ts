import * as chaiSpies from 'chai-spies';
import 'mocha';
import * as chai from 'chai';
import {Paris} from "./paris";
import {Todo} from "../mock/todo.entity";
import {Observable} from "rxjs";
import {Repository} from "../repository/repository";
import {DataEntityType, DataQuery, DataSet, IRepository, ReadonlyRepository} from "../main";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";

chai.use(chaiSpies);
const expect = chai.expect;

describe('Paris main', () => {
	let paris: Paris;

	describe('Get Todo repository', () => {
		paris = new Paris();
		const repo = paris.getRepository(Todo);

		it('should create a ToDo repository', () => {
			expect(repo).to.exist;
		});

		it('should return a Repository from getRepository', () => {
			expect(repo instanceof Repository).to.be.true;
		});

		xit('should return null if entity doesn\'t exist', () => {
		});
	});

	describe('Get Todo item by ID', () => {
		let repo: Repository<Todo>,
			item$: Observable<Todo>;

		before(() => {
			paris = new Paris();
			repo = paris.getRepository(Todo);
			chai.spy.on(repo, 'getItemById');
			item$ = paris.getItemById(Todo, 1);
		});

		it('should call Repository.getItemById with correct params', () => {
			expect(repo.getItemById).to.have.been.called.with(1, defaultDataOptions, undefined)
		});

		// it('should call Http.request', () => {
		// 	expect(Http.request).to.have.been.called.with('GET', '/todo/1', undefined, {timeout: 20000});
		// });

		it('should return an Observable from paris.getItemById', () => {
			expect(item$ instanceof Observable).to.be.true;
		});

		xit('should throw error if getItem is not supported', () => {
		});


	});

	describe('getModelBaseConfig', () => {
		before(() => {
			paris = new Paris();
		});

		it('should return the entityConfig for Todo', () => {
			expect(paris.getModelBaseConfig(Todo)).to.be.equal((<DataEntityType>Todo).entityConfig)
		});

		xit('should return the valueObjectConfig for a value-object', () => {
		})

	});

	describe('query', () => {
		let repo: Repository<Todo>;

		before(() => {
			paris = new Paris();
			repo = paris.getRepository(Todo);
			chai.spy.on(repo, 'query');
		});

		it('should call Repository.query with correct default params', () => {
			paris.query(Todo);
			expect(repo.query).to.have.been.called.with(undefined, defaultDataOptions)
		});

		it('should call Repository.query with correct params', () => {
			const query: DataQuery = {where: {a: 1}},
				dataOptions: DataOptions = {allowCache: false};
			paris.query(Todo, query, dataOptions);
			expect(repo.query).to.have.been.called.with(query, dataOptions)
		});

		it('should return an Observable from paris.query', () => {
			expect(paris.query(Todo) instanceof Observable).to.be.true;
		});

		xit('should throw error if repo doesn\'t exist', () => {
		});
	});

	describe('apiCall', () => {
		it('should add data to cache if configured to', () => {

		});

		it('should get data from cache if available and configured to', () => {

		});

		it('should not get data from cache if allowCache is false', () => {

		});

		it('should always add newer data to cache if cache exists', () => {

		});


	});

	xdescribe('callQuery', () => {

	});

	xdescribe('createItem', () => {

	});

	xdescribe('queryForItem', () => {

	});

	xdescribe('getRelatedItem', () => {

	});

	xdescribe('getValue', () => {

	});

});
