import {forkJoin, Observable, of} from 'rxjs';
import {Animal, Person, Thing} from '../mock/thing.entity';
import {DataStoreService} from '../../lib/data_access/data-store.service';
import {Paris} from '../../lib/paris';
import {Todo} from "../mock/todo.entity";
import {DataEntityType} from "../../lib/api/entity/data-entity.base";
import {Tag} from "../mock/tag.value-object";
import {Modeler} from "../../lib/modeling/modeler";
import {Field} from "../../lib/api/entity/entity-field";
import {FIELD_DATA_SELF} from "../../lib/config/entity-field.config";
import {TodoList} from "../mock/todo-list.entity";
import {TodoListState} from "../mock/todo-list-state.value-object";
import {Entity} from "../../lib/config/decorators/entity.decorator";
import {EntityModelBase} from "../../lib/config/entity-model.base";
import {Repository} from "../../lib/api/repository/repository";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";
import {TodoStatus} from "../mock/todo-status.entity";
import {ModelBase} from "../../lib/config/model.base";
import {ValueObject} from "../../lib/config/decorators/value-object.decorator";
import {ModelConfig} from "../../lib/config/model-config";

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

		it('adds a `$parent` property to submodels that are not frozen', done => {
			paris.modeler.modelEntity({ id: 1, name: 'First', state: { isDone: true } }, (<DataEntityType<TodoList>>TodoList).entityConfig).subscribe(todoList => {
				expect(todoList.state.$parent).toBe(todoList);
				done();
			});
		});

		it('adds a `$parent` property to value object sub models', done => {
			paris.modeler.modelEntity<TodoListState>({ isDone: true, isShared: false, previousState: { isDone: false, isShared: false }  }, (<DataEntityType<TodoListState>>TodoListState).valueObjectConfig).subscribe(todoListState => {
				expect(todoListState.previousState.$parent).toBe(todoListState);
				done();
			});
		});

		it("doesn't add a `$parent` property to readonly sub models", done => {
			todoItem$.subscribe((todoItem:Todo) => {
				expect(todoItem.tags.every(tag => tag.$parent === undefined));
				done();
			});
		});

		it("assigns a sub-model that has id === 0 from values", done => {
			const todoRawData = {
				id: 6,
				text: 'Pending...',
				time: 1534433193347,
				status: 0
			};

			paris.modeler.modelEntity(todoRawData, todoEntityConfig).subscribe(todoItem => {
				expect(todoItem.status).toBeInstanceOf(TodoStatus);
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

		describe('defaultValue', () => {
			it("doesn't set default value to a field that has value", done => {
				const todoRawData = { id: 1, text: 'First', isDone: true };
				const defaultIsDoneValue = (<DataEntityType<Todo>>Todo).entityConfig.fields.get('isDone').defaultValue;

				paris.modeler.modelEntity(todoRawData, (<DataEntityType<Todo>>Todo).entityConfig).subscribe(todo => {
					if (todoRawData.isDone !== defaultIsDoneValue)
						expect(todo.isDone).toBe(todoRawData.isDone);
					done();
				});
			});

			it('sets the default value to a field that has no value', done => {
				paris.modeler.modelEntity({ id: 1, text: 'First' }, (<DataEntityType<Todo>>Todo).entityConfig).subscribe(todo => {
					expect(todo.isDone).toBe((<DataEntityType<Todo>>Todo).entityConfig.fields.get('isDone').defaultValue);
					done();
				});
			});

			it('sets the default value to a field that has no value and models it', done => {
				paris.modeler.modelEntity({ id: 1, name: 'First' }, (<DataEntityType<TodoList>>TodoList).entityConfig).subscribe(todoList => {
					delete todoList.state.$parent;
					const defaultState = (<DataEntityType<TodoList>>TodoList).entityConfig.fields.get('state').defaultValue;
					expect(todoList.state).toEqual(defaultState);
					done();
				});
			});

			it('sets the default value to a field that has no value and models it', done => {
				paris.modeler.modelEntity({ id: 1, name: 'First' }, (<DataEntityType<TodoList>>TodoList).entityConfig).subscribe(todoList => {
					expect(todoList.state).toBeInstanceOf((<DataEntityType<TodoList>>TodoList).entityConfig.fields.get('state').type);
					done();
				});
			});

			it('deep clones the default value before setting the model value', done => {
				forkJoin([
						paris.modeler.modelEntity({ id: 1, text: 'First' }, (<DataEntityType<Todo>>Todo).entityConfig),
						paris.modeler.modelEntity({ id: 2, text: 'Second' }, (<DataEntityType<Todo>>Todo).entityConfig)
				]).subscribe(([first, second]) => {
					//verify that changing one model doesn't affect the other
					first.extraData.attachments.push('something');
					expect(second.extraData.attachments).toEqual([]);
					done();
				})

			});
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
					{ type: 'thing', name: 'It'},
				]);
			};

			DataStoreService.prototype.get = jest.fn((endpoint: string) => createData(endpoint)) as any;
			DataStoreService.prototype.request = jest.fn((method: string, endpoint: string) =>
				createData(endpoint)
			) as any;
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

		it('should support derived entity (single) with query', done => {
			paris.getItemById(Person, 1, undefined, {"fullMoon": true}).subscribe(item => {
				expect(item).toBeInstanceOf(Animal);
				done();
			});
		});

		it('should support derived entity (multiple)', done => {
			const repository = paris.getRepository(Thing);
			repository.query().subscribe(({ items }) => {
				expect(items).toHaveLength(3);

				const [animal, person, thing] = items;
				expect(animal).toBeInstanceOf(Animal);
				expect(person).toBeInstanceOf(Person);
				expect(thing).toBeInstanceOf(Thing);

				done();
			});
		});
	});

	describe("serializeItem", () => {
		let serializedEntity:{ new(data:any):any };
		let serializeItem:jest.Mock;
		let serializedItemRepo:Repository<any>;

		let serializedEntityWithValueObject:{ new(data:any):any };
		let serializedEntityWithValueObjectRepo:Repository<any>;

		beforeEach(() => {
			serializeItem = jest.fn();

			@ValueObject({
				singularName: 'property',
				pluralName: 'property'
			})
			class SerializedEntityPropertyValueObject extends ModelBase {
				@EntityField()
				prop1: string;

				@EntityField()
				prop2: string;
			}

			@Entity({
				singularName: "Serialized entity",
				pluralName: "Serialized entities",
				endpoint: "serialized",
				serializeItem: serializeItem
			})
			class SerializedEntity extends EntityModelBase {
				@EntityField() name:string;

				@EntityField()
				someArray:Array<Record<string, any>>;
			}

			@Entity({
				singularName: "Serialized entity2",
				pluralName: "Serialized entities2",
				endpoint: "serialized2",
			})
			class SerializedEntityWithValueObject extends EntityModelBase {
				@EntityField() name:string;
				@EntityField() val: SerializedEntityPropertyValueObject;
			}

			serializedEntity = SerializedEntity;
			serializedItemRepo = paris.getRepository(SerializedEntity);

			serializedEntityWithValueObject = SerializedEntityWithValueObject;
			serializedEntityWithValueObjectRepo = paris.getRepository(SerializedEntityWithValueObject);
		});

		it("calls the entity's `serializeItem` method with the proper params", () => {
			const newSerializedItem = new serializedEntity({ id: undefined, name: 'test', someArray: null });
			const serializationData = { test: 1 };

			serializedItemRepo.save(newSerializedItem, null, serializationData);
			expect(serializeItem).toBeCalledWith(newSerializedItem, newSerializedItem, (<DataEntityType<any>>serializedEntity).entityConfig, paris.config, serializationData);
		});

		it ("serializes the entity with the nested value object intact", () => {
			const newSerializedItem = { name: 'test', val: { prop1: 'test', prop2: 'test2' } };
			const serializedModel:Record<string, any> = paris.modeler.serializeModel<any>(newSerializedItem, serializedEntityWithValueObjectRepo.modelConfig as ModelConfig<any>);
			expect(serializedModel['val']).toBeDefined();
		});

		it("models an item with a non-entity array field", (done) => {
			const data = {
				name: "test",
				someArray: [ { hello: "Ben" }, { Hello: "Yossi" }]
			};

			paris.modeler.modelEntity(data, serializedItemRepo.modelConfig).subscribe((entity) => {
				expect(entity.someArray).toBeInstanceOf(Array);
				done();
			});
		})
	});
});
