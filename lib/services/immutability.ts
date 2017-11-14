import {Index} from "../models/index";

export class Immutability{
	/**
	 * Deep-freezes an object
	 * @param {T} obj The object to freeze
	 * @param {Set<any>} excluded For internal use, used to avoid infinite recursion, when a parent object is references in one of its children
	 * @returns {Readonly<T>}
	 */
	static freeze<T>(obj:T, excluded?:Set<any>):Readonly<T> {
		if (excluded && excluded.has(obj))
			return obj;

		if (!Object.isFrozen(obj))
			Object.freeze(obj);

		if (Object(obj) === "object") {
			let childrenExcluded:Set<any> = excluded ? new Set(excluded) : new Set;
			Object.getOwnPropertyNames(obj).forEach((prop: string) => Immutability.freeze((<Index>obj)[prop], childrenExcluded));
		}

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
