import {Observable} from "rxjs";
import {IEntityConfigBase} from "../../config/model-config";
import {ModelBase} from "../../config/model.base";
import {DataOptions} from "../../data_access/data.options";
import {DataQuery} from "../../data_access/data-query";
import {DataSet} from "../../data_access/dataset";

export interface IReadonlyRepository<T extends ModelBase = ModelBase>{
	entity:IEntityConfigBase,
	createItem:(itemData:any) => Observable<Readonly<T>>,
	createNewItem:() => T,
	getItemById:(id:any, options?:DataOptions, params?:{ [index:string]:any }) => Observable<T>,
	query:(options?:DataQuery) => Observable<DataSet<T>>,
	serializeItem:(item:T, serializationData?:any) => Object,
	allItems$:Observable<Array<T>>,
	endpointName:string,
	getEndpointUrl: (query?: DataQuery) => string,
}

export interface IRepository<T extends ModelBase = ModelBase> extends IReadonlyRepository<T>{
	save:(item:T) => Observable<T>
	//save$:Observable<any>
}
