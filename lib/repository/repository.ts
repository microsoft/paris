import {ModelEntity} from "../entity/entity.config";
import {DataEntityConstructor, DataEntityType} from "../entity/data-entity.base";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Field, FIELD_DATA_SELF} from "../entity/entity-field";
import {IRepository} from "./repository.interface";
import {DataStoreService} from "../services/data-store.service";
import {ParisConfig} from "../config/paris-config";
import {DataSetOptions} from "../dataset/dataset-options";
import {DataSet} from "../dataset/dataset";
import {Index} from "../models/index";
import {DataTransformersService} from "../services/data-transformers.service";
import {DataCache, DataCacheSettings} from "../services/cache";
import {valueObjectsService} from "../services/value-objects.service";
import * as _ from "lodash";
import {EntityConfigBase} from "../entity/entity-config.base";
import {ModelBase} from "../models/model.base";
import {EntityModelBase} from "../models/entity-model.base";
import {DataOptions, defaultDataOptions} from "../dataset/data.options";
import {Paris} from "../services/paris";
import {DatasetService} from "../services/dataset.service";
import {HttpOptions} from "../services/http.service";
import {DataAvailability} from "../dataset/data-availability.enum";

export class Repository<T extends EntityModelBase> implements IRepository {
	save$: Observable<T>;
	private _allItems$: Observable<Array<T>>;

	private _allValues: Array<T>;
	private _allValuesMap: Map<string, T>;
	private _cache: DataCache<T>;
	private _allItemsSubject$: Subject<Array<T>>;
	private _saveSubject$: Subject<T>;

	get allItems$(): Observable<Array<T>> {
		if (this._allValues)
			return Observable.merge(Observable.of(this._allValues), this._allItemsSubject$.asObservable());

		if (this.entity.loadAll)
			return this.setAllItems();

		return this._allItems$;
	}

	private get cache(): DataCache<T> {
		if (!this._cache) {
			let cacheSettings: DataCacheSettings<T> = Object.assign({
				getter: (itemId: string | number) => this.getItemById(itemId, {allowCache: false})
			}, this.entity.cache);

			this._cache = new DataCache<T>(cacheSettings);
		}

		return this._cache;
	}

	private get baseUrl(): string {
		if (!this.entity.baseUrl)
			return null;

		return this.entity.baseUrl instanceof Function ? this.entity.baseUrl(this.config) : this.entity.baseUrl;
	}

	constructor(public readonly entity: ModelEntity,
				private config: ParisConfig,
				private entityConstructor: DataEntityConstructor<T>,
				private dataStore: DataStoreService,
				private paris: Paris) {
		let getAllItems$: Observable<Array<T>> = this.getItemsDataSet().map(dataSet => dataSet.items);

		this._allItemsSubject$ = new Subject<Array<T>>();
		this._allItems$ = Observable.merge(getAllItems$, this._allItemsSubject$.asObservable());

		this._saveSubject$ = new Subject();
		this.save$ = this._saveSubject$.asObservable();
	}

	createItem(itemData: any, options: DataOptions = { allowCache: true, availability: DataAvailability.available }): Observable<T> {
		return Repository.getModelData(itemData, this.entity, this.config, this.paris, options);
	}

	createNewItem(): T {
		return new this.entityConstructor();
	}

	/**
	 * Populates the item dataset with any sub @model. For example, if an ID is found for a property whose type is an entity,
	 * the property's value will be an instance of that entity, for the ID, not the ID.
	 * @param {Index} rawData
	 * @param {EntityConfigBase} entity
	 * @param {ParisConfig} config
	 * @param {Paris} paris
	 * @param {DataOptions} options
	 * @returns {Observable<T extends EntityModelBase>}
	 */
	private static getModelData<T extends ModelBase>(rawData: Index, entity: EntityConfigBase, config: ParisConfig, paris: Paris, options: DataOptions = defaultDataOptions): Observable<T> {
		let entityIdProperty: string = entity.idProperty || config.entityIdProperty,
			modelData: Index = entity instanceof ModelEntity ? {id: rawData[entityIdProperty]} : {},
			subModels: Array<Observable<{ [index: string]: ModelBase | Array<ModelBase> }>> = [];

		let getModelDataError:Error = new Error(`Failed to create ${entity.singularName}.`);

		entity.fields.forEach((entityField: Field) => {
			let propertyValue: any;
			if (entityField.data) {
				if (entityField.data instanceof Array) {
					for (let i = 0, path:string; i < entityField.data.length && propertyValue === undefined; i++) {
						path = entityField.data[i];
						let value:any = path === FIELD_DATA_SELF ? rawData : _.get(rawData, path);
						if (value !== undefined && value !== null)
							propertyValue = value;
					}
				}
				else
					propertyValue = entityField.data === FIELD_DATA_SELF ? rawData : _.get(rawData, entityField.data);
			}
			else
				propertyValue = rawData[entityField.id];

			if (propertyValue === undefined || propertyValue === null) {
				if (entityField.required) {
					getModelDataError.message = getModelDataError.message + ` Field ${entityField.id} is required but it's ${propertyValue}.`;
					throw getModelDataError;
				}
				modelData[entityField.id] = entityField.isArray ? [] : entityField.defaultValue || null;
			}
			else {
				const getPropertyEntityValue$ = Repository.getSubModel(entityField, propertyValue, paris, config, options);
				if (getPropertyEntityValue$)
					subModels.push(getPropertyEntityValue$);
				else {
					modelData[entityField.id] = entityField.isArray
						? propertyValue
							? propertyValue.map((elementValue: any) => DataTransformersService.parse(entityField.type, elementValue))
							: []
						: DataTransformersService.parse(entityField.type, propertyValue);
				}
			}
		});

		let model$:Observable<T>;

		if (subModels.length) {
			model$ = Observable.combineLatest.apply(Observable, subModels).map((propertyEntityValues: Array<ModelPropertyValue>) => {
				propertyEntityValues.forEach((propertyEntityValue: { [index: string]: any }) => Object.assign(modelData, propertyEntityValue));

				let model: T;

				try {
					model = new entity.entityConstructor(modelData, rawData);
				} catch (e) {
					getModelDataError.message = getModelDataError.message + " Error: " + e.message;
					throw getModelDataError;
				}

				propertyEntityValues.forEach((modelPropertyValue: ModelPropertyValue) => {
					for (let p in modelPropertyValue) {
						let modelValue: ModelBase | Array<ModelBase> = modelPropertyValue[p];

						if (modelValue instanceof Array)
							modelValue.forEach((modelValueItem: ModelBase) => {
								if (!Object.isFrozen(modelValueItem))
									modelValueItem.$parent = model;
							});
						else if (!Object.isFrozen(modelValue))
							modelValue.$parent = model;
					}
				});

				return model;
			});
		}
		else {
			let model: T;

			try {
				model = new entity.entityConstructor(modelData, rawData);
			} catch (e) {
				getModelDataError.message = getModelDataError.message + " Error: " + e.message;
				throw getModelDataError;
			}

			model$ = Observable.of(model);
		}

		return entity.readonly ? model$.map(model => Object.freeze(model)) : model$;
	}

	private static getSubModel(entityField:Field, value:any, paris:Paris, config:ParisConfig, options: DataOptions = defaultDataOptions):Observable<ModelPropertyValue>{
		let getPropertyEntityValue$: Observable<ModelPropertyValue>;
		let mapValueToEntityFieldIndex: (value: ModelBase | Array<ModelBase>) => ModelPropertyValue = Repository.mapToEntityFieldIndex.bind(null, entityField.id);

		let repository:Repository<EntityModelBase> = paris.getRepository(entityField.type);
		let valueObjectType:EntityConfigBase = !repository && valueObjectsService.getEntityByType(entityField.type);

		if (!repository && !valueObjectType)
			return null;

		const getItem = repository
			? Repository.getEntityItem.bind(null, repository)
			: Repository.getValueObjectItem.bind(null, valueObjectType);

		if (entityField.isArray) {
			if (value.length) {
				let propertyMembers$: Array<Observable<ModelPropertyValue>> = value.map((memberData: any) => getItem(memberData, options, paris, config));
				getPropertyEntityValue$ = Observable.combineLatest.apply(Observable, propertyMembers$).map(mapValueToEntityFieldIndex);
			}
			else
				getPropertyEntityValue$ = Observable.of([]).map(mapValueToEntityFieldIndex);
		}
		else
			getPropertyEntityValue$ = getItem(value, options, paris, config)
				.map(mapValueToEntityFieldIndex);

		return getPropertyEntityValue$;
	}

	private static mapToEntityFieldIndex(entityFieldId: string, value: ModelBase | Array<ModelBase>): ModelPropertyValue {
		let data: ModelPropertyValue = {};
		data[entityFieldId] = value;
		return data;
	}

	private static getEntityItem<U extends EntityModelBase>(repository: Repository<U>, data: any, options: DataOptions = defaultDataOptions): Observable<U> {
		return Object(data) === data ? repository.createItem(data, options) : repository.getItemById(data, options);
	}

	private static getValueObjectItem<U extends ModelBase>(valueObjectType: EntityConfigBase, data: any, options: DataOptions = defaultDataOptions, paris: Paris, config?: ParisConfig): Observable<U> {
		// If the value object is one of a list of values, just set it to the model
		if (valueObjectType.values)
			return Observable.of(valueObjectType.getValueById(data) || valueObjectType.getDefaultValue() || null);

		return Repository.getModelData(data, valueObjectType, config, paris, options);
	}

	getItemsDataSet(options?: DataSetOptions, dataOptions: DataOptions = defaultDataOptions): Observable<DataSet<T>> {
		let getItemsDataSetError:Error = new Error(`Failed to get ${this.entity.pluralName}.`);
		const httpOptions:HttpOptions = DatasetService.dataSetOptionsToHttpOptions(options);

		return this.dataStore.get(`${this.entity.endpoint}/${this.entity.allItemsEndpoint || ''}`, httpOptions, this.baseUrl)
			.map((rawDataSet: any) => {
				const allItemsProperty = this.entity.allItemsProperty || this.config.allItemsProperty;

				let rawItems: Array<any> = rawDataSet instanceof Array ? rawDataSet : rawDataSet[allItemsProperty];

				if (!rawItems)
					console.warn(`Property '${this.config.allItemsProperty}' wasn't found in DataSet for Entity '${this.entity.pluralName}'.`);
				return {
					count: rawDataSet.count,
					items: rawItems
				}
			})
			.flatMap((dataSet: DataSet<any>) => {
				let itemCreators: Array<Observable<T>> = dataSet.items.map((itemData: any) => this.createItem(itemData, dataOptions));

				return Observable.combineLatest.apply(this, itemCreators).map((items: Array<T>) => {
					return Object.freeze({
						count: dataSet.count,
						items: items
					});
				}).catch((error:Error) => {
					getItemsDataSetError.message = getItemsDataSetError.message + " Error: " + error.message;
					throw getItemsDataSetError;
				});
			});
	}

	getItemById(itemId: string | number, options: DataOptions = defaultDataOptions): Observable<T> {
		if (this.entity.values) {
			const entityValue: T = this.entity.getValueById(itemId);
			return Observable.of(entityValue || this.entity.getDefaultValue());
		}

		if (options.allowCache !== false && this.entity.cache)
			return this.cache.get(itemId);

		if (this.entity.loadAll)
			return this.setAllItems().map(() => this._allValuesMap.get(String(itemId)));
		else {
			return this.dataStore.get(`${this.entity.endpoint}/${itemId}`)
				.flatMap(data => this.createItem(data, options));
		}
	}

	private setAllItems(): Observable<Array<T>> {
		if (this._allValues)
			return Observable.of(this._allValues);

		return this.getItemsDataSet().do((dataSet: DataSet<T>) => {
			this._allValues = dataSet.items;
			this._allValuesMap = new Map();
			this._allValues.forEach((value: T) => this._allValuesMap.set(String(value.id), value));
		}).map(dataSet => dataSet.items);
	}

	// save(item: T): Observable<T> {
	// 	let saveData: Index = this.getItemSaveData(item);
	//
	// 	return this.dataStore.post(`${this.entity.endpoint}/${item.id || ''}`, saveData)
	// 		.flatMap((savedItemData: Index) => this.createItem(savedItemData))
	// 		.do((item: T) => {
	// 			if (this._allValues) {
	// 				this._allValues = [...this._allValues, item];
	// 				this._allItemsSubject$.next(this._allValues);
	// 			}
	//
	// 			this._saveSubject$.next(item);
	// 		});
	// }

	getItemSaveData(item: T): Index {
		let modelData: Index = {};

		for (let propertyId in item) {
			if (item.hasOwnProperty(propertyId)) {
				let modelValue: any;

				let propertyValue: any = item[propertyId],
					entityField: Field = this.entity.fields.get(propertyId);

				if (entityField) {
					let propertyRepository: IRepository = this.paris.getRepository(entityField.type);

					if (propertyRepository)
						modelValue = (<EntityModelBase>propertyValue).id;
					else
						modelValue = DataTransformersService.serialize(entityField.type, propertyValue);

					modelData[entityField.id] = modelValue;
				}
			}
		}

		return modelData;
	}
}

type ModelPropertyValue = { [property: string]: ModelBase | Array<ModelBase> };
