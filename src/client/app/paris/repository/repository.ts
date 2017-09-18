import {ModelEntity} from "../entity/entity.config";
import {DataEntityConstructor} from "../entity/data-entity.base";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Field} from "../entity/entity-field";
import {RepositoryManagerService} from "./repository-manager.service";
import {IRepository} from "./repository.interface";
import {DataStoreService} from "../services/data-store/data-store.service";
import {IIdentifiable} from "../models/identifiable.model";
import {ParisConfig} from "../config/paris-config";
import {DataSetOptions} from "../dataset/dataset-options";
import {DataSet} from "../dataset/dataset";
import {Index} from "../models/index";
import {DataTransformersService} from "../services/data-transformers.service";

export class Repository<T extends IIdentifiable>{
	save$:Subject<T> = new Subject<T>();

	private _allValues:Array<T>;
	private _allValuesMap:Map<any, T>;

	constructor(public readonly entity:ModelEntity,
				private config:ParisConfig,
				private entityConstructor:DataEntityConstructor<T>,
				private dataStore:DataStoreService,
				private repositoryManagerService:RepositoryManagerService){}

	createItem(itemData:any):Observable<T>{
		return this.getModelData(itemData)
			.map((modelData:ModelData) => new this.entityConstructor(modelData));
	}

	/**
	 * Populates the item dataset with any sub @model. For example, if an ID is found for a property whose type is an entity,
	 * the property's value will be an instance of that entity, for the ID, not the ID.
	 * @param itemData
	 * @returns {Observable<ModelData>}
	 */
	private getModelData(itemData:Index):Observable<ModelData>{
		let modelData:ModelData = { id: itemData.id },
			subModels:Array<Observable<{ [key:string]:any }>> = [];

		this.entity.fields.forEach((entityField:Field) => {
			let propertyValue:any = itemData[entityField.data || entityField.id];

			if (propertyValue === undefined || propertyValue === null){
				modelData[entityField.id] = entityField.defaultValue || null;
			}
			else {
				let propertyRepository:IRepository = this.repositoryManagerService.getRepository(entityField.type);

				// TODO: Use isArray and set array data, as well as property data.

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
					modelData[entityField.id] = DataTransformersService.parse(entityField.type, propertyValue);
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

	getItemsDataSet(options?:DataSetOptions):Observable<DataSet<T>>{
		return this.dataStore.get(this.entity.endpoint + "/", options)
			.map((rawDataSet:any) => {
				let rawItems:Array<any> = rawDataSet[this.config.allItemsProperty];

				if (!rawItems)
					console.warn(`Property '${this.config.allItemsProperty}' wasn't found in DataSet for Entity '${this.entity.pluralName}'.`);
				return {
					count: rawDataSet.count,
					items: rawItems
				}
			})
			.flatMap((dataSet:DataSet<any>) => {
				let itemCreators:Array<Observable<T>> = dataSet.items.map((itemData:any) => this.createItem(itemData));

				return Observable.combineLatest.apply(this, itemCreators).map((items:Array<T>) => {
					return {
						count: dataSet.count,
						items: items
					};
				})
			});
	}

	getItemById(itemId:string|number):Observable<T>{
		if (this.entity.loadAll){
			if (!this._allValues){
				return this.getItemsDataSet()
					.do((dataSet:DataSet<T>) => {
						this._allValues = dataSet.items;
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

	save(item:T):Observable<T>{
		let saveData:Index = this.getItemSaveData(item);

		return this.dataStore.post(`${this.entity.endpoint}/${item.id || ''}`, saveData)
			.flatMap((savedItemData:Index) => this.createItem(savedItemData))
			.do((item:T) => this.save$.next(item));
	}

	getItemSaveData(item:T):Index{
		let modelData:Index = {};

		for (let propertyId in item){
			let modelValue:any;

			let propertyValue:any = item[propertyId],
				entityField:Field = this.entity.fields.get(propertyId);

			if (entityField) {
				let propertyRepository: IRepository = this.repositoryManagerService.getRepository(entityField.type);

				if (propertyRepository)
					modelValue = (<IIdentifiable>propertyValue).id;
				else
					modelValue = DataTransformersService.serialize(entityField.type, propertyValue);

				modelData[entityField.id] = modelValue;
			}
		}

		return modelData;
	}
}

interface ModelData extends IIdentifiable, Index{
}
