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
import {Immutability} from "../services/immutability";
import {DataCache, DataCacheSettings} from "../services/cache";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ModelObjectValue} from "../entity/object-value.config";
import {objectValuesService} from "../services/object-values.service";

export class Repository<T extends IIdentifiable> implements IRepository{
	save$:Observable<T>;
	private _allItems$:Observable<Array<T>>;

	private _allValues:Array<T>;
	private _allValuesMap:Map<any, T>;
	private _cache:DataCache<T>;
	private _allItemsSubject$:Subject<Array<T>>;
	private _saveSubject$:Subject<T>;

	get allItems$():Observable<Array<T>>{
		if (this._allValues)
			return Observable.merge(Observable.of(this._allValues), this._allItemsSubject$.asObservable());

		return this._allItems$;
	}

	private get cache():DataCache<T>{
		if (!this._cache) {
			let cacheSettings:DataCacheSettings<T> = Object.assign({
				getter: (itemId:string | number) => this.getItemById(itemId, false)
			}, this.entity.cache);

			this._cache = new DataCache<T>(cacheSettings);
		}

		return this._cache;
	}

	constructor(public readonly entity:ModelEntity,
				private config:ParisConfig,
				private entityConstructor:DataEntityConstructor<T>,
				private dataStore:DataStoreService,
				private repositoryManagerService:RepositoryManagerService){
		let getAllItems$:Observable<Array<T>> = this.getItemsDataSet().map(dataSet => dataSet.items);

		this._allItemsSubject$ = new Subject<Array<T>>();
		this._allItems$ = Observable.merge(getAllItems$, this._allItemsSubject$.asObservable());

		this._saveSubject$ = new Subject();
		this.save$ = this._saveSubject$.asObservable();
	}

	createItem(itemData:any):Observable<Readonly<T>>{
		return this.getModelData(itemData)
			.map((modelData:ModelData) => Immutability.freeze(new this.entityConstructor(modelData)));
	}

	createNewItem():T{
		return new this.entityConstructor();
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

				if (propertyRepository){
					let getPropertyEntityValue$:Observable<Index>;
					let mapValueToEntityFieldIndex:(value:any) => Index = Repository.mapToEntityFieldIndex.bind(this, entityField.id);

					if (entityField.isArray){
						let propertyMembers$:Array<Observable<T>> = propertyValue.map((memberData:any) => this.getEntityItem(propertyRepository, memberData));
						getPropertyEntityValue$ = Observable.combineLatest.apply(this, propertyMembers$).map(mapValueToEntityFieldIndex);
					}
					else{
						getPropertyEntityValue$ = this.getEntityItem(propertyRepository, propertyValue).map(mapValueToEntityFieldIndex);
					}

					subModels.push(getPropertyEntityValue$);
				}
				else {
					let objectValueType:ModelObjectValue = objectValuesService.getEntityByType(entityField.type);

					if (objectValueType)
						modelData[entityField.id] = objectValueType.getValueById(propertyValue) || propertyValue;
					else {
						modelData[entityField.id] = entityField.isArray
							? propertyValue.map((elementValue: any) => DataTransformersService.parse(entityField.type, elementValue))
							: DataTransformersService.parse(entityField.type, propertyValue);
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

	private static mapToEntityFieldIndex(entityFieldId:string, value:any):Index{
		let data:Index = {};
		data[entityFieldId] = value;
		return data;
	}

	private getEntityItem(repository:IRepository, itemData:any):Observable<T>{
		return Object(itemData) === itemData ? repository.createItem(itemData) : repository.getItemById(itemData);
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
					return Object.freeze({
						count: dataSet.count,
						items: Object.freeze(items)
					});
				})
			});
	}

	getItemById(itemId:string|number, allowCache:boolean = true):Observable<T>{
		if (allowCache !== false && this.entity.cache)
			return this.cache.get(itemId);

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
			.do((item:T) => {
				if (this._allValues){
					this._allValues = this._allValues.concat([item]);
					this._allItemsSubject$.next(this._allValues);
				}

				this._saveSubject$.next(item);
			});
	}

	getItemSaveData(item:T):Index{
		let modelData:Index = {};

		for (let propertyId in item){
			if (item.hasOwnProperty(propertyId)) {
				let modelValue: any;

				let propertyValue: any = item[propertyId],
					entityField: Field = this.entity.fields.get(propertyId);

				if (entityField) {
					let propertyRepository: IRepository = this.repositoryManagerService.getRepository(entityField.type);

					if (propertyRepository)
						modelValue = (<IIdentifiable>propertyValue).id;
					else
						modelValue = DataTransformersService.serialize(entityField.type, propertyValue);

					modelData[entityField.id] = modelValue;
				}
			}
		}

		return modelData;
	}
}

interface ModelData extends IIdentifiable, Index{
}
