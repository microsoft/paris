import { of } from 'rxjs';
import { Animal, Person, Thing } from '../mock/thing.entity';
import { DataStoreService } from '../services/data-store.service';
import { Paris } from '../services/paris';

describe('ReadonlyRepository', () => {
	describe('getModalData', () => {
		let paris: Paris;

		beforeEach(() => {
			paris = new Paris();

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
