import {ModelBase} from "../models/model.base";
import {DataEntityConstructor} from "../entity/data-entity.base";
import {Paris} from "../services/paris";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {DataQuery} from "../dataset/data-query";
import {combineLatest, Observable, of} from "rxjs";
import {DataSet} from "../dataset/dataset";
import {ReadonlyRepository} from "./readonly-repository";
import {map} from "rxjs/operators";

const DEFAULT_ALL_ITEMS_PROPERTY = 'items';

export function rawDataToDataSet<TEntity extends ModelBase, TRawData = any, TDataSet extends any = any>(
		rawDataSet:TDataSet,
		entityConstructor:DataEntityConstructor<TEntity>,
		allItemsProperty:string,
		paris:Paris,
		dataOptions:DataOptions = defaultDataOptions,
		query?:DataQuery):Observable<DataSet<TEntity>>{
	let dataSet:DataSet<TRawData> = parseDataSet(rawDataSet, allItemsProperty, entityConstructor.entityConfig.parseDataSet);

	if (!dataSet.items || !dataSet.items.length)
		return of({ count: 0, items: [] });

	return modelArray<TEntity, TRawData>(dataSet.items, entityConstructor, paris, dataOptions, query).pipe(
		map((items:Array<TEntity>) => {
			return Object.freeze(Object.assign(dataSet, {
				items: items,
			}));
		})
	);
}

export function parseDataSet<TRawData = any, TDataSet extends any = any>(rawDataSet:TDataSet, allItemsProperty:string = DEFAULT_ALL_ITEMS_PROPERTY, parseDataSet?:(rawDataSet:TDataSet) => DataSet<TRawData>):DataSet<TRawData>{
	return rawDataSet instanceof Array
			? { count: 0, items: rawDataSet }
			: parseDataSet
				? parseDataSet(rawDataSet) || { count: 0, items: [] }
				: { count: rawDataSet.count, items: rawDataSet[allItemsProperty] };
}

export function modelArray<TEntity extends ModelBase, TRawData = any>(
	rawData:Array<TRawData>,
	entityConstructor:DataEntityConstructor<TEntity>,
	paris:Paris,
	dataOptions:DataOptions = defaultDataOptions,
	query?:DataQuery):Observable<Array<TEntity>>{
	if (!rawData.length)
		return of([]);
	else {
		const itemCreators: Array<Observable<TEntity>> = rawData.map((itemData: TRawData) =>
			modelItem<TEntity, TRawData>(entityConstructor, itemData, paris, dataOptions, query));

		return combineLatest.apply(this, itemCreators);
	}
}

export function modelItem<TEntity extends ModelBase, TRawData = any>(entityConstructor:DataEntityConstructor<TEntity>, rawData:TRawData, paris:Paris, dataOptions: DataOptions = defaultDataOptions, query?:DataQuery):Observable<TEntity>{
	return ReadonlyRepository.getModelData(rawData, entityConstructor.entityConfig || entityConstructor.valueObjectConfig, paris.config, paris, dataOptions, query);
}
