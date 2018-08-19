import {Observable, of} from 'rxjs';
import {Animal, Person, Thing} from '../mock/thing.entity';
import {DataStoreService} from '../services/data-store.service';
import {Paris} from '../services/paris';
import {Todo} from "../mock/todo.entity";
import {DataEntityType} from "../entity/data-entity.base";
import {Tag} from "../mock/tag.value-object";
import {Modeler} from "./modeler";
import {Field} from "../entity/entity-field";
import {FIELD_DATA_SELF} from "../entity/entity-field.config";

describe('Modeler', () => {
	let paris: Paris;

	beforeEach(() => {
		paris = new Paris();
	});

	describe('modelData', () => {
		const todoItemRawData = {
			id: 1,
			text: 'Write tests',
			time: 1534433193347,
			tags: [
				{ text: 'First tag', colorHexa: '#666' },
				{ text: 'Second tag', colorName: 'yellow' },
				{ text: 'Third tag' },
			]
		};

		const todoEntityConfig = (<DataEntityType<Todo>>Todo).entityConfig;

		let todoItem$:Observable<Todo>;

		beforeEach(() => {
			todoItem$ = paris.modeler.modelEntity(todoItemRawData, todoEntityConfig);
		});
		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should model a ToDo item', done => {
			todoItem$.subscribe((todoItem:Todo) => {
				expect(todoItem).toBeInstanceOf(Todo);
				done();
			});
		});

		it('should model a Date EntityField', done => {
			todoItem$.subscribe((todoItem:Todo) => {
				expect(todoItem.time).toBeInstanceOf(Date);
				done();
			});
		});

		it('models an array EntityField', done => {
			todoItem$.subscribe((todoItem:Todo) => {
				expect(todoItem.tags).toBeInstanceOf(Array);
				expect(todoItem.tags.length).toEqual(todoItemRawData.tags.length);
				expect(todoItem.tags.every(tag => tag instanceof Tag)).toBe(true);
				done();
			});
		});

		it('freezes a model marked as readonly', done => {
			todoItem$.subscribe((todoItem:Todo) => {
				expect(todoItem.tags.every(tag => Object.isFrozen(tag))).toBe(true);
				done();
			});
		});
	});

	describe('model configuration', () => {
		describe('data', () => {
			let baseField:Field,
				rawData:any;

			beforeEach(() => {
				baseField = { id: 'name' };
				rawData = {
					name: 'Lynn',
					alias: 'lynnar',
					fullName: {
						firstName: 'Lynn',
						lastName: 'Armand'
					}
				};
			});

			it('uses the id of the field if no data was specified', () => {
				expect(Modeler.getFieldRawData(baseField, rawData)).toEqual(rawData.name);
			});

			it('uses the "data" of the field as the path of the data to use', () => {
				const fieldConfig = Object.assign({ data: 'alias' }, baseField);
				expect(Modeler.getFieldRawData(fieldConfig, rawData)).toEqual(rawData[fieldConfig.data]);
			});

			it('uses the "data" of the field as the path of the data to use, even inside objects', () => {
				const fieldConfig = Object.assign({ data: 'fullName.firstName' }, baseField);
				expect(Modeler.getFieldRawData(fieldConfig, rawData)).toEqual(rawData.fullName.firstName);
			});

			it('uses the "data" of the field to prioritize raw data properties', () => {
				const fieldConfig = Object.assign({ data: ['exactName', 'alias', "name"] }, baseField);
				expect(Modeler.getFieldRawData(fieldConfig, rawData)).toEqual(rawData.alias);
			});

			it('uses the "data" of the field to prioritize raw data properties, event for paths', () => {
				const fieldConfig = Object.assign({ data: ['exactName', 'fullName.firstName', 'alias', "name"] }, baseField);
				expect(Modeler.getFieldRawData(fieldConfig, rawData)).toEqual(rawData.fullName.firstName);
			});

			it('uses the special "FIELD_DATA_SELF" data config to use the whole rawData', () => {
				const fieldConfig = Object.assign({ data: FIELD_DATA_SELF }, baseField);
				expect(Modeler.getFieldRawData(fieldConfig, rawData)).toEqual(rawData);
			})
		});
	});

	describe('modelWith', () => {
		beforeEach(() => {
			const createData = (endpoint: string) => {
				// Single item
				if (/things\/\d+/.test(endpoint)) {
					return of({ type: 'animal', name: 'woof', kind: 'dog' });
				}

				return of([
					{ type: 'animal', name: 'woof', kind: 'dog' },
					{ type: 'person', name: 'Joe', address: '1 Generic st.' },
				]);
			};

			DataStoreService.prototype.get = jest.fn((endpoint: string) => createData(endpoint));
			DataStoreService.prototype.request = jest.fn((method: string, endpoint: string) =>
				createData(endpoint)
			);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should support derived entity (single)', done => {
			paris.getItemById(Thing, 1).subscribe(item => {
				expect(item).toBeInstanceOf(Animal);
				done();
			});
		});

		it('should support derived entity (multiple)', done => {
			const repository = paris.getRepository(Thing);
			repository.query().subscribe(({ items }) => {
				expect(items).toHaveLength(2);

				const [animal, person] = items;
				expect(animal).toBeInstanceOf(Animal);
				expect(person).toBeInstanceOf(Person);

				done();
			});
		});
	});
});
