import {ModelBase} from "../models/model.base";
import {DataEntityConstructor} from "../entity/data-entity.base";
import {Paris} from "../services/paris";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {DataQuery} from "../dataset/data-query";
import {Observable} from "rxjs/Observable";
import {DataSet} from "../dataset/dataset";
import {of} from "rxjs/observable/of";
import {ReadonlyRepository} from "./readonly-repository";
import {combineLatest} from "rxjs/observable/combineLatest";
import {map} from "rxjs/operators/map";

export function rawDataToDataSet<T extends ModelBase, R = any>(
		rawDataSet:any,
		entityConstructor:DataEntityConstructor<T>,
		allItemsProperty:string,
		paris:Paris,
		dataOptions:DataOptions = defaultDataOptions,
		query?:DataQuery):Observable<DataSet<T>>{
		let rawItems: Array<R> = rawDataSet instanceof Array ? rawDataSet : rawDataSet[allItemsProperty];

		if (!rawItems || !rawItems.length)
			return of({ count: 0, items: [] });

		return modelArray<T, R>(rawItems, entityConstructor, paris, dataOptions, query).pipe(
			map((items:Array<T>) => {
				return Object.freeze({
					count: rawDataSet.count,
					items: items,
					next: rawDataSet.next,
					previous: rawDataSet.previous
				});
			})
		);
	}

export function modelArray<T extends ModelBase, R = any>(
	data:Array<any>,
	entityConstructor:DataEntityConstructor<T>,
	paris:Paris,
	dataOptions:DataOptions = defaultDataOptions,
	query?:DataQuery):Observable<Array<T>>{
	if (!data.length)
		return of([]);
	else {
		const itemCreators: Array<Observable<T>> = data.map((itemData: R) =>
			modelItem<T, R>(entityConstructor, itemData, paris, dataOptions, query));

		return combineLatest.apply(this, itemCreators);
	}
}

export function modelItem<T extends ModelBase, R = any>(entityConstructor:DataEntityConstructor<T>, data:R, paris:Paris, dataOptions: DataOptions = defaultDataOptions, query?:DataQuery):Observable<T>{
	return ReadonlyRepository.getModelData(data, entityConstructor.entityConfig || entityConstructor.valueObjectConfig, paris.config, paris, dataOptions, query);
}
