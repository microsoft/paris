import {EntityFields} from "./entity-fields";
import {Immutability} from "../services/immutability";
import {DataEntityConstructor} from "./data-entity.base";
import {ParisConfig} from "../config/paris-config";
import {ModelBase} from "../models/model.base";
import {HttpOptions} from "../services/http.service";
import {EntityId} from "../models/entity-id.type";
import {Field} from "./entity-field";

const DEFAULT_VALUE_ID = "__default";

export class EntityConfigBase<TEntity extends ModelBase = any, TRawData = any, TId extends EntityId = string> implements ModelConfig<TEntity, TRawData, TId>{
	singularName:string;
	pluralName:string;
	fields?:EntityFields;
	idProperty?:keyof TRawData;
	readonly:boolean = false;
	serializeItem?:(item:Partial<TEntity>, serializedItem?:any, entity?:IEntityConfigBase<TEntity, TRawData, TId>, config?:ParisConfig, serializationData?:any) => any;

	get fieldsArray():Array<Field>{
		return this.fields ? Array.from(this.fields.values()) : [];
	}

	values:Array<TEntity>;

	private _valuesMap:Map<EntityId, TEntity>;
	private get valuesMap():Map<EntityId, TEntity> {
		if (this._valuesMap === undefined) {
			if (!this.values)
				this._valuesMap = null;
			else {
				this._valuesMap = new Map;
				this.values.forEach(value => {
					this._valuesMap.set(value.id === undefined || value.id === null ? DEFAULT_VALUE_ID : value.id, Object.freeze(value));
				});
			}
		}

		return this._valuesMap;
	}

	private _supportedEntityGetMethodsSet:Readonly<Set<EntityGetMethod>>;

	constructor(config:IEntityConfigBase<TEntity, TRawData, TId>, public entityConstructor:DataEntityConstructor<TEntity, TRawData, TId>){
		if (config.values) {
			config.values = config.values.map(valueConfig => new entityConstructor(valueConfig));
			Immutability.freeze(config.values);
		}

		Object.assign(this, config);

		this._supportedEntityGetMethodsSet = Object.freeze(new Set(config.supportedEntityGetMethods
			? config.supportedEntityGetMethods
			: [EntityGetMethod.getItem, EntityGetMethod.query]
		));
	}

	getValueById(valueId:EntityId):TEntity{
		return this.valuesMap ? this.valuesMap.get(valueId) : null;
	}

	getDefaultValue():TEntity{
		return this.getValueById(DEFAULT_VALUE_ID) || null;
	}

	hasValue(valueId:EntityId):boolean{
		return this.valuesMap ? this.valuesMap.has(valueId) : false;
	}

	supportsGetMethod(getMethod:EntityGetMethod):boolean{
		return this._supportedEntityGetMethodsSet.has(getMethod);
	}
}

export interface IEntityConfigBase<TEntity extends ModelBase = any, TRawData = any, TId extends EntityId = string>{
	/**
	 * Human-readable name for the Entity type, singular. e.g 'User', 'To do item', 'Movie', 'Comment', etc.
	 * Used internally for error messages, for example, or can be used in reflection.
	 */
	singularName:string,

	/**
	 * Human-readable name for the Entity type, plural. e.g 'Users', 'To do items', 'Movies', 'Comments', etc.
	 * Used internally for error messages, for example, or can be used in reflection.
	 */
	pluralName:string,

	/**
	 * The property in the raw data used for the Entity's ID.
	 */
	idProperty?:keyof TRawData,

	/**
	 * If readonly is set to `true`, all models of this entity type will be immutable - frozen with Object.freeze.
	 * Readonly models don't have a $parent property.
	 *
	 * @default false
	 */
	readonly?:boolean,

	/**
	 * Hard-coded items for this Entity. When values are specified, no endpoint is required, and items are always returned from these values, instead of backend.
	 *
	 * @example <caption>Hard-coding values for an Entity</caption>
	 * ```typescript
	 * @Entity({
	 * 		singularName: "Status",
	 * 		pluralName: "Statuses",
	 * 		values: [
	 * 			{ id: 1, name: 'Open' },
	 * 			{ id: 2, name: 'In progress' },
	 * 			{ id: 3, name: 'Done' }
	 * 		]
	 * })
	 * export class Status extends EntityModelBase<number>{
	 * 		@EntityField()
	 * 		name: string;
	 * }
	 * ```
	 *
	 * Then when requesting an item for Status, either directly (with getValue or getItemById) or when sub-modeling, the hard-coded values are used:
	 *
	 * ```typescript
	 * // Async way:
	 * paris.getItemById(Status, 1).subscribe(status => console.log('Status with ID 1: ', status);
	 *
	 * // Sync:
	 * console.log('Status with ID 1: ', paris.getValue(Status, 1));
	 * ```
	 */
	values?:Array<TEntity>,

	/**
	 * Tests whether the entity contains a hard-coded value with the specified ID (in the entities `values` configuration).
	 * @param {EntityId} valueId
	 * @returns {boolean}
	 */
	hasValue?: (valueId:EntityId) => boolean,
	getDefaultValue?: () => TEntity,
	getValueById?: (valueId:EntityId) => TEntity,
	entityConstructor?:DataEntityConstructor<TEntity, TRawData, TId>,
	serializeItem?:(item:Partial<TEntity>, serializedItem?:any, entity?:IEntityConfigBase<TEntity, TRawData, TId>, config?:ParisConfig, serializationData?:any) => TRawData,
	supportedEntityGetMethods?:Array<EntityGetMethod>,
	parseSaveItemsQuery?: (items:Array<TEntity>, options?:HttpOptions, entity?:IEntityConfigBase<TEntity, TRawData, TId>, config?:ParisConfig) => HttpOptions
}

export interface ModelConfig<TEntity extends ModelBase, TRawData = any, TId extends EntityId = string> extends IEntityConfigBase<TEntity, TRawData, TId>{
	fields?:EntityFields,
	fieldsArray?:Array<Field>,
}

export enum EntityGetMethod{
	getItem,
	query
}
