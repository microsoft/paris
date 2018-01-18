import {EntityFields} from "./entity-fields";
import {Field} from "./entity-field";
import {Immutability} from "../services/immutability";
import {DataEntityConstructor} from "./data-entity.base";

const DEFAULT_VALUE_ID = "__default";

export class EntityConfigBase implements IEntityConfigBase{
	singularName:string;
	pluralName:string;
	fields?:EntityFields;
	idProperty?:string;
	readonly:boolean = false;

	get fieldsArray():Array<Field>{
		return this.fields ? Array.from(this.fields.values()) : [];
	}

	values:Array<any>;

	private _valuesMap:Map<string|number, any>;
	private get valuesMap():Map<string|number, any> {
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

	constructor(config:IEntityConfigBase, public entityConstructor:DataEntityConstructor<any>){
		if (config.values) {
			config.values = config.values.map(valueConfig => new entityConstructor(valueConfig));
			Immutability.freeze(config.values);
		}

		Object.assign(this, config);
	}

	getValueById<T>(valueId:string|number):T{
		return this.valuesMap ? this.valuesMap.get(valueId) : null;
	}

	getDefaultValue<T>():T{
		return this.getValueById(DEFAULT_VALUE_ID) || null;
	}

	hasValue(valueId:string|number):boolean{
		return this.valuesMap ? this.valuesMap.has(valueId) : false;
	}
}

export interface IEntityConfigBase{
	singularName:string,
	pluralName:string,
	fields?:EntityFields,
	idProperty?:string,
	readonly?:boolean,
	values?:Array<any>,
	fieldsArray?:Array<Field>,
	hasValue?: (valueId:string|number) => boolean,
	getDefaultValue?: () => any,
	getValueById?: (valueId:string|number) => any,
	entityConstructor?:DataEntityConstructor<any>
}
