import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiSpies from 'chai-spies';
import 'mocha';
import {Paris} from "./paris";
import {Todo} from "../mock/todo.entity";
import {Observable} from "rxjs/index";
import {Http} from "./http.service";
import {DataStoreService} from "./data-store.service";

chai.use(chaiSpies);
const expect = chai.expect;

describe('Paris main', () => {
	let paris:Paris;
	before(() => {
		paris = new Paris();
	});

	beforeEach(() => {
		paris = new Paris();
	});

	it('should create a ToDo repository', () => {
		expect(paris.getRepository(Todo)).to.exist;
	});

	it('should return an Observable from paris.getItemById', () => {
		expect(paris.getItemById(Todo, 1) instanceof Observable).to.be.true;
	});

	describe('Get Todo item by ID', () => {
		before(() => {
			chai.spy.on(Http, "request");
			chai.spy.on(DataStoreService, "get");
		});

		beforeEach(() => {
			paris.getItemById(Todo, 1);
		});

		it ('should call datastore.get', () => {
			expect((<any>DataStoreService).get).to.have.been.called;
		});

		it ('should call Http.request', () => {
			expect(Http.request).to.have.been.called.with('GET', '/todo/1', undefined, { timeout: 20000 });
		});
	});

});
