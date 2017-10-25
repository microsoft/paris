import {EntityFields} from "./entity-fields";
import {Field} from "./entity-field";
import {IIdentifiable} from "../models/identifiable.model";
import {Immutability} from "../services/immutability";
import {DataEntityConstructor} from "./data-entity.base";

export class EntityConfigBase{
	singularName:string;
	pluralName:string;
	fields?:EntityFields;
	idProperty?:string;

	get fieldsArray():Array<Field>{
		return this.fields ? Array.from(this.fields.values()) : [];
	}

	values:ReadonlyArray<IIdentifiable>;

	private _valuesMap:Map<string|number, IIdentifiable>;
	private get valuesMap():Map<string|number, IIdentifiable> {
		if (this._valuesMap === undefined) {
			if (!this.values)
				this._valuesMap = null;
			else {
				this._valuesMap = new Map;
				this.values.forEach(value => this._valuesMap.set(value.id, value));
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

	getValueById(valueId:string|number):IIdentifiable{
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
	values?:Array<IIdentifiable>
}
