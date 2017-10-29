import {EntityFields} from "./entity-fields";
import {Field} from "./entity-field";
import {EntityModelConfigBase} from "../models/entity-config-base.interface";
import {Immutability} from "../services/immutability";
import {DataEntityConstructor} from "./data-entity.base";

export class EntityConfigBase{
	singularName:string;
	pluralName:string;
	fields?:EntityFields;
	idProperty?:string;
	readonly:boolean = false;

	get fieldsArray():Array<Field>{
		return this.fields ? Array.from(this.fields.values()) : [];
	}

	values:ReadonlyArray<any>;

	private _valuesMap:Map<string|number, any>;
	private get valuesMap():Map<string|number, any> {
		if (this._valuesMap === undefined) {
			if (!this.values)
				this._valuesMap = null;
			else {
				this._valuesMap = new Map;
				this.values.forEach(value => this._valuesMap.set(value.id, Object.freeze(value)));
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
	values?:Array<EntityModelConfigBase>
}
