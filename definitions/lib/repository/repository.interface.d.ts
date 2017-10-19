import { Observable } from "rxjs/Observable";
import { IIdentifiable } from "../models/identifiable.model";
import { DataSetOptions } from "../dataset/dataset-options";
import { DataSet } from "../dataset/dataset";
import { ModelEntity } from "../entity/entity.config";
export interface IRepository {
    entity: ModelEntity;
    createItem: (itemData: any) => Observable<Readonly<any>>;
    createNewItem: () => IIdentifiable;
    getItemById: (id: any) => Observable<any>;
    getItemsDataSet: (options?: DataSetOptions) => Observable<DataSet<any>>;
    getItemSaveData: (item: IIdentifiable) => Object;
    allItems$: Observable<Array<any>>;
    save: (item: IIdentifiable) => Observable<IIdentifiable>;
    save$: Observable<any>;
}
