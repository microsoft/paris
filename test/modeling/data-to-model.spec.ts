import 'reflect-metadata';
import {Modeler} from '../../lib/modeling/modeler';
import {DataSet} from "../../lib/data_access/dataset";

const rawDataSet: RawDataSet = {
	results: [
		{
			id: 1,
			name: 'First',
		},
		{
			id: 2,
			name: 'Seconds',
		},
	],
	$next: '/api/todolist?page=2',
	total: 123,
};

describe('Raw data -> model', () => {
	describe('Create a DataSet', () => {
		let dataSet: DataSet<SimpleEntity>;

		beforeAll(() => {
			dataSet = Modeler.parseDataSet<SimpleEntity, RawDataSet>(
				rawDataSet,
				'results',
				parseRawDataSet
			);
		});

		it('has items', () => {
			expect(dataSet.items.length).toEqual(rawDataSet.results.length);
		});

		it('has a next property', () => {
			expect(dataSet.next).toEqual(rawDataSet.$next);
		});
	});
});

function parseRawDataSet(rawDataSet: RawDataSet): DataSet<SimpleEntity> {
	return {
		items: rawDataSet.results,
		next: rawDataSet.$next,
		count: rawDataSet.total,
	};
}

interface SimpleEntity {
	id: number;
	name: string;
}

interface RawDataSet {
	results: Array<SimpleEntity>;
	$next: string;
	total: number;
}
