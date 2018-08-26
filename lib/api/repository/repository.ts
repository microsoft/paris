import {EntityConfig} from "../../config/entity.config";
import {DataEntityType} from "../entity/data-entity.base";
import {combineLatest, defer, merge, Observable, of, Subject, throwError} from "rxjs";
import {IRepository} from "./repository.interface";
import {ModelBase} from "../../config/model.base";
import {EntityModelBase} from "../../config/entity-model.base";
import {Paris} from "../../paris";
import {HttpOptions, RequestMethod, SaveRequestMethod} from "../../data_access/http.service";
import {SaveEntityEvent} from "../events/save-entity.event";
import {RemoveEntitiesEvent} from "../events/remove-entities.event";
import {ReadonlyRepository} from "./readonly-repository";
import {AjaxError} from "rxjs/ajax";
import {catchError, map, mergeMap, tap} from "rxjs/operators";
import {findIndex, flatMap} from "lodash-es";
import {DataSet} from "../../data_access/dataset";

/**
 * A Repository is a service through which all of an Entity's data is fetched, cached and saved back to the backend.
 *
 * This class handles entities that can be added, updated or removed. see `ReadonlyRepository` base class.
 */
export class Repository<TEntity extends ModelBase, TRawData = any> extends ReadonlyRepository<TEntity, TRawData> implements IRepository<TEntity> {
	save$: Observable<SaveEntityEvent>;
	remove$: Observable<RemoveEntitiesEvent>;

	private _saveSubject$: Subject<SaveEntityEvent>;
	private _removeSubject$: Subject<RemoveEntitiesEvent>;

	constructor(entityConstructor: DataEntityType<TEntity>,
				paris: Paris) {
		super(entityConstructor, paris);

		const getAllItems$: Observable<Array<TEntity>> = defer(() => this.query().pipe(map((dataSet:DataSet<TEntity>) => dataSet.items)));

		this._allItemsSubject$ = new Subject<Array<TEntity>>();
		this._allItems$ = merge(getAllItems$, this._allItemsSubject$.asObservable());

		this._saveSubject$ = new Subject();
		this._removeSubject$ = new Subject();
		this.save$ = this._saveSubject$.asObservable();
		this.remove$ = this._removeSubject$.asObservable();
	}

	get entity():EntityConfig<TEntity, TRawData> {
		return <EntityConfig<TEntity>>this.entityConstructor.entityConfig;
	}

	/**
	 * Saves an entity to the server
	 * @param item
	 * @param {HttpOptions} options
	 * @param {any} serializationData Any data to pass to serialize or serializeItem
	 */
	save(item: Partial<TEntity>, options?:HttpOptions, serializationData?:any): Observable<TEntity> {
		if (!this.entityBackendConfig.endpoint)
			throw new Error(`Entity ${this.entityConstructor.entityConfig.singularName || this.entityConstructor.name} can't be saved - it doesn't specify an endpoint.`);

		try {
			const isNewItem:boolean = item.id === undefined;
			const saveData: TRawData = this.serializeItem(item, serializationData);
			const endpointName:string = this.getEndpointName(options && options.params ? { where: options.params } : null);
			const endpoint:string = this.entityBackendConfig.parseSaveQuery ? this.entityBackendConfig.parseSaveQuery(item, this.entity, this.paris.config, options) : `${endpointName}/${item.id || ''}`;

			return this.paris.dataStore.save(endpoint, this.getSaveMethod(item), Object.assign({}, options, {data: saveData}), this.getBaseUrl(options && {where: options.params}))
				.pipe(
					catchError((err: AjaxError) => {
						this.emitEntityHttpErrorEvent(err);
						throw err;
					}),
					mergeMap((savedItemData: TRawData) =>
						savedItemData ? this.createItem(savedItemData) : of(null)),
					tap((savedItem: TEntity) => {
						if (savedItem && this._allValues) {
							this._allValues = [...this._allValues, savedItem];
							this._allItemsSubject$.next(this._allValues);
						}

						this._saveSubject$.next({ entity: this.entityConstructor, newValue: item, isNew: isNewItem });
					})
				);
		}
		catch(e){
			return throwError(e);
		}
	}

	private getSaveMethod(item:Partial<TEntity>):SaveRequestMethod{
		return this.entityBackendConfig.saveMethod
			? this.entityBackendConfig.saveMethod instanceof Function ? this.entityBackendConfig.saveMethod(item, this.paris.config) : this.entityBackendConfig.saveMethod
			: item.id === undefined ? "POST" : "PUT";
	}

	/**
	 * Saves multiple items to the server, all at once
	 * @param {Array<T extends EntityModelBase>} items
	 * @returns {Observable<Array<T extends EntityModelBase>>}
	 */
	saveItems(items:Array<TEntity>, options?:HttpOptions):Observable<Array<TEntity>>{
		if (!this.entityBackendConfig.endpoint)
			throw new Error(`${this.entity.pluralName} can't be saved - it doesn't specify an endpoint.`);

		let newItems:SaveItems = { method: "POST", items: [] },
			existingItems:SaveItems = { method: "PUT", items: [] };

		items.forEach((item:any) => {
			let saveMethod:RequestMethod = this.getSaveMethod(item);
			(saveMethod === "POST" ? newItems : existingItems).items.push(this.serializeItem(item));
		});

		let saveItemsArray:Array<Observable<Array<TEntity>>> = [newItems, existingItems]
			.filter((saveItems:SaveItems) => saveItems.items.length)
			.map((saveItems:SaveItems) => this.doSaveItems(saveItems.items, saveItems.method, options));

		return combineLatest.apply(this, saveItemsArray).pipe(
			map((savedItems:Array<Array<TEntity>>) => flatMap(savedItems)),
			tap((savedItems:Array<TEntity>) => {
				if (savedItems && savedItems.length && this._allValues) {
					let itemsAdded: Array<TEntity> = [];
					savedItems.forEach((item:TEntity) => {
						const originalItemIndex:number = findIndex(this._allValues,_item => item.id === _item.id);
						if (!!~originalItemIndex)
							this._allValues[originalItemIndex] = item;
						else itemsAdded.push(item);
					});
					if (itemsAdded.length)
						this._allValues = [...this._allValues, ...itemsAdded];
					this._allItemsSubject$.next(this._allValues);

					this._saveSubject$.next({ entity: this.entityConstructor, newValue: savedItems, isNew: !!itemsAdded });
				}
			})
		);
	}

	/**
	 * Does the actual saving to server for a list of items.
	 * @param {Array<any>} itemsData
	 * @param {"PUT" | "POST"} method
	 * @returns {Observable<Array<T extends EntityModelBase>>}
	 */
	private doSaveItems(itemsData:Array<any>, method:"PUT" | "POST", options?:HttpOptions):Observable<Array<TEntity>>{
		const saveHttpOptions:HttpOptions = this.entity.parseSaveItemsQuery
			? this.entity.parseSaveItemsQuery(itemsData, options, this.entity, this.paris.config)
			: Object.assign({}, options, {data: {items: itemsData}});

		const endpointName:string = this.getEndpointName(options && options.params ? { where: options.params } : null);

		return this.paris.dataStore.save(`${endpointName}/`, method, saveHttpOptions, this.getBaseUrl(options && {where: options.params}))
			.pipe(
				catchError((err: AjaxError) => {
					this.emitEntityHttpErrorEvent(err);
					throw err
				}),
				mergeMap((savedItemsData?: Array<any> | {items:Array<any>}) => {
					if (!savedItemsData)
						return of([]);

					let itemsData:Array<any> = savedItemsData instanceof Array ? savedItemsData : savedItemsData.items;
					let itemCreators:Array<Observable<TEntity>> = itemsData.map(savedItemData => this.createItem(savedItemData));
					return combineLatest.apply(this, itemCreators);
				})
			)
	}

	/**
	 * Sends a DELETE request to the backend for deleting an item.
	 */
	removeItem(item:TEntity, options?:HttpOptions):Observable<TEntity>{
		if (!item)
			return of(null);

		if (!this.entityBackendConfig.endpoint)
			throw new Error(`Entity ${this.entity.singularName} can't be deleted - it doesn't specify an endpoint.`);

		try {
			let httpOptions:HttpOptions = options || { data: {}};
			if (!httpOptions.data)
				httpOptions.data = {};

			if (this.entityBackendConfig.getRemoveData)
				Object.assign(httpOptions.data, this.entityBackendConfig.getRemoveData([item]));

			const endpointName:string = this.getEndpointName(options && options.params ? { where: options.params } : null);
			const endpoint:string = this.entityBackendConfig.parseRemoveQuery ? this.entityBackendConfig.parseRemoveQuery([item], this.entity, this.paris.config) : `${endpointName}/${item.id || ''}`;

			return this.paris.dataStore.delete(endpoint, httpOptions, this.getBaseUrl(options && {where: options.params}))
				.pipe(
					catchError((err: AjaxError) => {
						this.emitEntityHttpErrorEvent(err);
						throw err;
					}),
					tap(() => {
						if (this._allValues) {
							let itemIndex:number = findIndex(this._allValues, (_item:TEntity) => _item.id === item.id);
							if (~itemIndex)
								this._allValues.splice(itemIndex, 1);

							this._allItemsSubject$.next(this._allValues);
						}

						this._removeSubject$.next({ entity: this.entityConstructor, items: [item] });
					}),
					map(() => item)
				)
		}
		catch(e){
			return throwError(e);
		}
	}

	/**
	 * Sends a DELETE request to the backend for deleting multiple entities.
	 * @param {Array<TEntity extends ModelBase>} items
	 * @param {HttpOptions} options
	 * @returns {Observable<Array<TEntity extends ModelBase>>}
	 */
	remove(items:Array<TEntity>, options?:HttpOptions):Observable<Array<TEntity>>{
		if (!items)
			throw new Error(`No ${this.entity.pluralName.toLowerCase()} specified for removing.`);

		if (!(items instanceof Array))
			items = [items];

		if (!items.length)
			return of([]);

		if (!this.entityBackendConfig.endpoint)
			throw new Error(`Entity ${this.entity.singularName} can't be deleted - it doesn't specify an endpoint.`);

		try {
			let httpOptions:HttpOptions = options || { data: {}};
			if (!httpOptions.data)
				httpOptions.data = {};

			Object.assign(httpOptions.data, this.entityBackendConfig.getRemoveData
				? this.entityBackendConfig.getRemoveData(items)
				: { ids: items.map(item => item.id) }
			);

			const endpointName:string = this.getEndpointName(options && options.params ? { where: options.params } : null);
			const endpoint:string = this.entityBackendConfig.parseRemoveQuery ? this.entityBackendConfig.parseRemoveQuery(items, this.entity, this.paris.config) : endpointName;

			return this.paris.dataStore.delete(endpoint, httpOptions, this.getBaseUrl(options && {where: options.params}))
				.pipe(
					catchError((err: AjaxError) => {
						this.emitEntityHttpErrorEvent(err);
						throw err;
					}),
					tap(() => {
						if (this._allValues) {
							items.forEach((item:TEntity) => {
								let itemIndex:number = findIndex(this._allValues, (_item:TEntity) => _item.id === item.id);
								if (~itemIndex)
									this._allValues.splice(itemIndex, 1);
							});

							this._allItemsSubject$.next(this._allValues);
						}

						this._removeSubject$.next({ entity: this.entityConstructor, items: items });
					}),
					map(() => items)
				)
		}
		catch(e){
			return throwError(e);
		}
	}
}

interface SaveItems{
	method: "POST" | "PUT",
	items:Array<any>
}
