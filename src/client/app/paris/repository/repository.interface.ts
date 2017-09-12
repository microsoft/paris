import {Observable} from "rxjs/Observable";

export interface IRepository{
	createItem:(itemData:any) => Observable<any>,
	getItemById:(id:any) => Observable<any>
}
