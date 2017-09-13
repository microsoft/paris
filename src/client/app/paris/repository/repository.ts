import {ModelEntity} from "../entity/entity.config";
import {DataEntityConstructor} from "../entity/data-entity.base";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Field} from "../entity/entity-field";
import {RepositoryManagerService} from "./repository-manager.service";
import {IRepository} from "./repository.interface";
import {DataSet} from "../data/dataset";
import {DataStoreService} from "../services/data-store/data-store.service";
import {IIdentifiable} from "../models/identifiable.model";

export class Repository<T extends IIdentifiable>{
	save$:Subject<T> = new Subject<T>();

	private _allValues:Array<T>;
	private _allValuesMap:Map<any, T>;

	constructor(public readonly entity:ModelEntity,
				private entityConstructor:DataEntityConstructor<T>,
				private dataStore:DataStoreService,
				private repositoryManagerService:RepositoryManagerService){}

	createItem(itemData:any):Observable<T>{
		return this.getModelData(itemData)
			.map((modelData:ModelData) => new this.entityConstructor(modelData));
	}

	/**
	 * Populates the item data with any sub @model. For example, if an ID is found for a property whose type is an entity,
	 * the property's value will be an instance of that entity, for the ID, not the ID.
	 * @param itemData
	 * @returns {Observable<ModelData>}
	 */
	private getModelData(itemData:any):Observable<ModelData>{
		let modelData:ModelData = { id: itemData.id },
			subModels:Array<Observable<{ [key:string]:any }>> = [];

		this.entity.fields.forEach((entityField:Field) => {
			let propertyValue:any = itemData[entityField.data || entityField.id];

			if (propertyValue === undefined || propertyValue === null){
				modelData[entityField.id] = entityField.defaultValue || null;
			}
			else {
				if (entityField.type){
					let propertyRepository:IRepository = this.repositoryManagerService.getRepository(entityField.type);

					if (propertyRepository){
						let propertyEntityValue:Observable<any> = Object(propertyValue) === propertyValue ? propertyRepository.createItem(propertyValue) : propertyRepository.getItemById(propertyValue),
							getPropertyEntityValue:Observable<{ [index:string]:any }> = propertyEntityValue.map((propertyEntityValue:any) => {
								let data:{ [index:string]:any } = {};
								data[entityField.id] = propertyEntityValue;
								return data;
							});


						subModels.push(getPropertyEntityValue);
					}
					else {
						modelData[entityField.id] = propertyValue;
					}
				}
			}
		});

		if (subModels.length) {
			return Observable.combineLatest.apply(this, subModels).map((propertyEntityValues: Array<{ [index: string]: any }>) => {
				propertyEntityValues.forEach((propertyEntityValue: { [index: string]: any }) => Object.assign(modelData, propertyEntityValue));
				return new this.entityConstructor(modelData);
			});
		}
		else
			return Observable.of(modelData);
	}

	getItemsDataSet(options?:any):Observable<DataSet<T>>{
		return this.dataStore.get(this.entity.endpoint + "/", options).flatMap((dataSet:DataSet<any>) => {
			let itemCreators:Array<Observable<T>> = dataSet.results.map((itemData:any) => this.createItem(itemData));

			return Observable.combineLatest.apply(this, itemCreators).map((items:Array<T>) => {
				return {
					count: dataSet.count,
					results: items
				};
			})
		});
	}

	getItemById(itemId:string|number):Observable<T>{
		if (this.entity.loadAll){
			if (!this._allValues){
				return this.getItemsDataSet()
					.do((dataSet:DataSet<T>) => {
						this._allValues = dataSet.results;
						this._allValuesMap = new Map();
						this._allValues.forEach((value:T) => this._allValuesMap.set(value.id, value));
					})
					.map((dataSet:DataSet<T>) => this._allValuesMap.get(itemId));
			}
			else
				return Observable.of(this._allValuesMap.get(itemId));
		}
		else {
			return this.dataStore.get(`${this.entity.endpoint}/${itemId}`)
				.flatMap(data => this.createItem(data));
		}
	}

	save(item:T):void{
		console.log("SAVE: ", item);
		this.save$.next(item);
	}
}

interface ModelData extends IIdentifiable{
	[index:string]:any
}
