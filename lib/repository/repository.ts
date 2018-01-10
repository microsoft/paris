import {EntityConfig} from "../entity/entity.config";
import {DataEntityConstructor} from "../entity/data-entity.base";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IRepository} from "./repository.interface";
import {DataStoreService} from "../services/data-store.service";
import {ParisConfig} from "../config/paris-config";
import {Index} from "../models/index";
import * as _ from "lodash";
import {ModelBase} from "../models/model.base";
import {EntityModelBase} from "../models/entity-model.base";
import {Paris} from "../services/paris";
import {HttpOptions} from "../services/http.service";
import {SaveEntityEvent} from "../events/save-entity.event";
import {RemoveEntitiesEvent} from "../events/remove-entities.event";
import {ReadonlyRepository} from "./readonly-repository";

export class Repository<T extends ModelBase> extends ReadonlyRepository<T> implements IRepository {
	save$: Observable<SaveEntityEvent>;
	remove$: Observable<RemoveEntitiesEvent>;

	private _saveSubject$: Subject<SaveEntityEvent>;
	private _removeSubject$: Subject<RemoveEntitiesEvent>;

	constructor(entity: EntityConfig,
				config: ParisConfig,
				entityConstructor: DataEntityConstructor<T>,
				dataStore: DataStoreService,
				paris: Paris) {
		super(entity, entity, config, entityConstructor, dataStore, paris);

		let getAllItems$: Observable<Array<T>> = this.query().map(dataSet => dataSet.items);

		this._allItemsSubject$ = new Subject<Array<T>>();
		this._allItems$ = Observable.merge(getAllItems$, this._allItemsSubject$.asObservable());

		this._saveSubject$ = new Subject();
		this._removeSubject$ = new Subject();
		this.save$ = this._saveSubject$.asObservable();
		this.remove$ = this._removeSubject$.asObservable();
	}

	/**
	 * Saves an entity to the server
	 * @param {T} item
	 * @returns {Observable<T extends EntityModelBase>}
	 */
	save(item: T): Observable<T> {
		if (!this.entityBackendConfig.endpoint)
			throw new Error(`Entity ${this.entityConstructor.name} can't be saved - it doesn't specify an endpoint.`);

		try {
			let isNewItem:boolean = item.id === undefined;
			let saveData: Index = this.serializeItem(item);
			return this.dataStore.save(`${this.endpointName}/${item.id || ''}`, isNewItem ? "POST" : "PUT", { data: saveData }, this.baseUrl)
				.flatMap((savedItemData: Index) => savedItemData ? this.createItem(savedItemData) : Observable.of(null))
				.do((savedItem: T) => {
					if (savedItem && this._allValues) {
						this._allValues = [...this._allValues, savedItem];
						this._allItemsSubject$.next(this._allValues);
					}

					this._saveSubject$.next({ entity: this.entityConstructor, newValue: item, isNew: isNewItem });
				});
		}
		catch(e){
			return Observable.throw(e);
		}
	}

	/**
	 * Saves multiple items to the server, all at once
	 * @param {Array<T extends EntityModelBase>} items
	 * @returns {Observable<Array<T extends EntityModelBase>>}
	 */
	saveItems(items:Array<T>):Observable<Array<T>>{
		if (!this.entityBackendConfig.endpoint)
			throw new Error(`${this.entity.pluralName} can't be saved - it doesn't specify an endpoint.`);

		let newItems:SaveItems = { method: "POST", items: [] },
			existingItems:SaveItems = { method: "PUT", items: [] };

		items.forEach((item:any) => {
			(item.id === undefined ? newItems : existingItems).items.push(this.serializeItem(item));
		});

		let saveItemsArray:Array<Observable<Array<T>>> = [newItems, existingItems]
			.filter((saveItems:SaveItems) => saveItems.items.length)
			.map((saveItems:SaveItems) => this.doSaveItems(saveItems.items, saveItems.method));

		return Observable.combineLatest.apply(this, saveItemsArray).map((savedItems:Array<Array<T>>) => _.flatMap(savedItems));
	}

	/**
	 * Does the actual saving to server for a list of items.
	 * @param {Array<any>} itemsData
	 * @param {"PUT" | "POST"} method
	 * @returns {Observable<Array<T extends EntityModelBase>>}
	 */
	private doSaveItems(itemsData:Array<any>, method:"PUT" | "POST"):Observable<Array<T>>{
		return this.dataStore.save(`${this.endpointName}/`, method, { data: { items: itemsData } }, this.baseUrl)
			.flatMap((savedItemsData?: Array<any> | {items:Array<any>}) => {
				if (!savedItemsData)
					return Observable.of(null);

				let itemsData:Array<any> = savedItemsData instanceof Array ? savedItemsData : savedItemsData.items;
				let itemCreators:Array<Observable<T>> = itemsData.map(savedItemData => this.createItem(savedItemData));
				return Observable.combineLatest.apply(this, itemCreators);
			});
	}

	remove(items:Array<T>, options?:HttpOptions):Observable<Array<T>>{
		if (!items)
			throw new Error(`No ${this.entity.pluralName.toLowerCase()} specified for removing.`);

		if (!(items instanceof Array))
			items = [items];

		if (!items.length)
			return Observable.of([]);

		if (!this.entityBackendConfig.endpoint)
			throw new Error(`Entity ${this.entityConstructor.name} can't be deleted - it doesn't specify an endpoint.`);

		try {
			let httpOptions:HttpOptions = options || { data: {}};
			httpOptions.data.ids = items.map(item => item.id);

			return this.dataStore.delete(this.endpointName, httpOptions, this.baseUrl)
				.do(() => {
					if (this._allValues) {
						items.forEach((item:T) => {
							let itemIndex:number = _.findIndex(this._allValues, (_item:T) => _item.id === item.id);
							if (~itemIndex)
								this._allValues.splice(itemIndex, 1);
						});

						this._allItemsSubject$.next(this._allValues);
					}

					this._removeSubject$.next({ entity: this.entityConstructor, items: items });
				}).map(() => items);
		}
		catch(e){
			return Observable.throw(e);
		}
	}
}

interface SaveItems{
	method: "POST" | "PUT",
	items:Array<any>
}
