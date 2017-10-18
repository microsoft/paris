import {Index} from "../models/index";

export class Immutability{
	static freeze<T>(obj:T):Readonly<T> {
		if (!Object.isFrozen(obj))
			Object.freeze(obj);

		if (Object(obj) === obj)
			Object.getOwnPropertyNames(obj).forEach((prop: string) => Immutability.freeze((<Index>obj)[prop]));

		return obj;
	}

	static unfreeze<T>(obj:Readonly<T>):T{
		if (Object(obj) !== obj || obj instanceof Date || obj instanceof RegExp || obj instanceof Function)
			return obj;

		let unfrozenObj:T = Object.create(obj.constructor.prototype);
		Object.assign(unfrozenObj, obj);

		Object.getOwnPropertyNames(obj).forEach((prop: string) => {
			(<Index>unfrozenObj)[prop] = Immutability.unfreeze((<Index>unfrozenObj)[prop]);
		});

		return unfrozenObj;
	}
}
