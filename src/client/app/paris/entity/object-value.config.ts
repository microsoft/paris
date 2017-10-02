import {EntityConfigBase, IEntityConfigBase} from "./entity-config.base";
import {IIdentifiable} from "../models/identifiable.model";
import {Immutability} from "../services/immutability";

export class ModelObjectValue extends EntityConfigBase{
	values:ReadonlyArray<IIdentifiable>;

	private _valuesMap:Map<string|number, IIdentifiable>;

	constructor(config:ObjectValueConfig){
		super(config);

		if (config.values) {
			Immutability.freeze(this.values);
		}
	}

	getValueById(valueId:string|number):IIdentifiable{
		if (!this.values)
			return null;

		if (!this._valuesMap) {
			this._valuesMap = new Map;
			this.values.forEach(value => this._valuesMap.set(value.id, value));
		}
		return this._valuesMap ? this._valuesMap.get(valueId) : null;
	}
}

export interface ObjectValueConfig extends IEntityConfigBase{
	values:ReadonlyArray<IIdentifiable>
}
