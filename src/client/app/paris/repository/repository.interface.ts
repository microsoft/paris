import {Observable} from "rxjs/Observable";
import {IIdentifiable} from "../models/identifiable.model";
import {DataSetOptions} from "../dataset/dataset-options";
import {DataSet} from "../dataset/dataset";

export interface IRepository{
	createItem:(itemData:any) => Observable<any>,
	getItemById:(id:any) => Observable<any>,
	getItemsDataSet:(options?:DataSetOptions) => Observable<DataSet<any>>,
	getItemSaveData:(item:IIdentifiable) => Object
}
