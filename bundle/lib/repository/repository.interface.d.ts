import { Observable } from "rxjs/Observable";
import { DataQuery } from "../dataset/data-query";
import { DataSet } from "../dataset/dataset";
import { IEntityConfigBase } from "../entity/entity-config.base";
import { ModelBase } from "../models/model.base";
import { DataOptions } from "../dataset/data.options";
export interface IReadonlyRepository {
    entity: IEntityConfigBase;
    createItem: (itemData: any) => Observable<Readonly<any>>;
    createNewItem: () => ModelBase;
    getItemById: (id: any, options?: DataOptions, params?: {
        [index: string]: any;
    }) => Observable<any>;
    query: (options?: DataQuery) => Observable<DataSet<any>>;
    serializeItem: (item: ModelBase) => Object;
    allItems$: Observable<Array<any>>;
    endpointName: string;
    endpointUrl: string;
}
export interface IRepository extends IReadonlyRepository {
    save: (item: ModelBase) => Observable<ModelBase>;
}
