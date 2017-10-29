import {Observable} from "rxjs/Observable";
import {DataSetOptions} from "../dataset/dataset-options";
import {DataSet} from "../dataset/dataset";
import {ModelEntity} from "../entity/entity.config";
import {EntityModelBase} from "../models/entity-model.base";

export interface IRepository{
	entity:ModelEntity,
	createItem:(itemData:any) => Observable<Readonly<any>>,
	createNewItem:() => EntityModelBase,
	getItemById:(id:any) => Observable<any>,
	getItemsDataSet:(options?:DataSetOptions) => Observable<DataSet<any>>,
	getItemSaveData:(item:EntityModelBase) => Object,
	allItems$:Observable<Array<any>>,
	save:(item:EntityModelBase) => Observable<EntityModelBase>,
	save$:Observable<any>
}
