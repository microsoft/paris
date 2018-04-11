import {EntityFields} from "./entity-fields";
import {Field} from "./entity-field";
import {Immutability} from "../services/immutability";
import {DataEntityConstructor} from "./data-entity.base";
import {ParisConfig} from "../config/paris-config";
import {ModelBase} from "../models/model.base";

const DEFAULT_VALUE_ID = "__default";

export class EntityConfigBase<T extends ModelBase = any> implements IEntityConfigBase{
	singularName:string;
	pluralName:string;
	fields?:EntityFields;
	idProperty?:string;
	readonly:boolean = false;
	serializeItem?:(item:T, serializedItem?:any, entity?:IEntityConfigBase, config?:ParisConfig) => any;

	get fieldsArray():Array<Field>{
		return this.fields ? Array.from(this.fields.values()) : [];
	}

	values:Array<T>;

	private _valuesMap:Map<string|number, T>;
	private get valuesMap():Map<string|number, T> {
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

	constructor(config:IEntityConfigBase<T>, public entityConstructor:DataEntityConstructor<T>){
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

	getValueById(valueId:string|number):T{
		return this.valuesMap ? this.valuesMap.get(valueId) : null;
	}

	getDefaultValue():T{
		return this.getValueById(DEFAULT_VALUE_ID) || null;
	}

	hasValue(valueId:string|number):boolean{
		return this.valuesMap ? this.valuesMap.has(valueId) : false;
	}

	supportsGetMethod(getMethod:EntityGetMethod):boolean{
		return this._supportedEntityGetMethodsSet.has(getMethod);
	}
}

export interface IEntityConfigBase<T extends ModelBase = any>{
	singularName:string,
	pluralName:string,
	fields?:EntityFields,
	idProperty?:string,
	readonly?:boolean,
	values?:Array<T>,
	fieldsArray?:Array<Field>,
	hasValue?: (valueId:string|number) => boolean,
	getDefaultValue?: () => T,
	getValueById?: (valueId:string|number) => T,
	entityConstructor?:DataEntityConstructor<T>,
	serializeItem?:(item:T, serializedItem?:any, entity?:IEntityConfigBase<T>, config?:ParisConfig) => any,
	supportedEntityGetMethods?:Array<EntityGetMethod>
}

export enum EntityGetMethod{
	getItem,
	query
}
