import {EntityFields} from "./entity-fields";
import {Immutability} from "../services/immutability";
import {DataEntityConstructor} from "./data-entity.base";
import {ParisConfig} from "../config/paris-config";
import {ModelBase} from "../models/model.base";
import {HttpOptions} from "../services/http.service";
import {EntityId} from "../models/entity-id.type";
import {Field} from "./entity-field";

const DEFAULT_VALUE_ID = "__default";

export class EntityConfigBase<TEntity extends ModelBase<TRawData> = any, TRawData = any> implements IEntityConfigBase<TEntity, TRawData>{
	singularName:string;
	pluralName:string;
	fields?:EntityFields;
	idProperty?:string;
	readonly:boolean = false;
	serializeItem?:(item:TEntity, serializedItem?:any, entity?:IEntityConfigBase<TEntity, TRawData>, config?:ParisConfig, serializationData?:any) => any;

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

	constructor(config:IEntityConfigBase<TEntity, TRawData>, public entityConstructor:DataEntityConstructor<TEntity>){
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

export interface IEntityConfigBase<TEntity extends ModelBase = any, TRawData = any>{
	singularName:string,
	pluralName:string,
	fields?:EntityFields,
	idProperty?:string,
	readonly?:boolean,
	values?:Array<TEntity>,
	fieldsArray?:Array<Field>,
	hasValue?: (valueId:EntityId) => boolean,
	getDefaultValue?: () => TEntity,
	getValueById?: (valueId:EntityId) => TEntity,
	entityConstructor?:DataEntityConstructor<TEntity>,
	serializeItem?:(item:TEntity, serializedItem?:any, entity?:IEntityConfigBase<TEntity>, config?:ParisConfig, serializationData?:any) => TRawData,
	supportedEntityGetMethods?:Array<EntityGetMethod>,
	parseSaveItemsQuery?: (items:Array<TEntity>, options?:HttpOptions, entity?:IEntityConfigBase<TEntity>, config?:ParisConfig) => HttpOptions
}

export enum EntityGetMethod{
	getItem,
	query
}
