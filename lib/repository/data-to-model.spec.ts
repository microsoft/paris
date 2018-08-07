import "reflect-metadata"
import * as chai from 'chai';
import '../services/paris.init.spec';
import {DataSet} from "../dataset/dataset";
import {parseDataSet} from "./data-to-model";

const expect = chai.expect;

const rawDataSet:RawDataSet = {
	results: [
		{
			id: 1,
			name: "First"
		},
		{
			id: 2,
			name: "Seconds"
		}
	],
	$next: '/api/todolist?page=2',
	total: 123
};

describe('Raw data -> model', () => {
	describe('Create a DataSet', () => {
		let dataSet:DataSet<SimpleEntity>;

		before(() => {
			console.log("REFLECT", Reflect);
			dataSet = parseDataSet<SimpleEntity, RawDataSet>(rawDataSet, 'results', parseRawDataSet);
		});

		it('has items', () => {
			expect(dataSet.items.length).to.equal(rawDataSet.results.length);
		});

		it('has a next property', () => {
			expect(dataSet.next).to.equal(rawDataSet.$next);
		})
	});
});

function parseRawDataSet(rawDataSet:RawDataSet):DataSet<SimpleEntity>{
	return {
		items: rawDataSet.results,
		next: rawDataSet.$next,
		count: rawDataSet.total
	}
}

interface SimpleEntity{
	id:number,
	name:string
}

interface RawDataSet {
	results: Array<SimpleEntity>,
	$next: string,
	total: number
}
