import {Observable} from "rxjs/Observable";
import {IIdentifiable} from "../models/identifiable.model";

export interface IRepository{
	createItem:(itemData:any) => Observable<any>,
	getItemById:(id:any) => Observable<any>,
	getItemSaveData:(item:IIdentifiable) => Object
}
