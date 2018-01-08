import {DataEntityType} from "../entity/data-entity.base";

const transformers:Array<DataTransformer> = [
	{
		type: Date,
		parse: (dateValue:string) => new Date(dateValue),
		serialize: (date:Date) => date ? date.toISOString() : null
	},
	{
		type: RegExp,
		parse: (pattern:string) => new RegExp(pattern),
		serialize: (regExp:RegExp) => regExp ? regExp.toString().match(/^\/(.*)\/$/)[1] : null
	}
];

const transformersMap:Map<DataEntityType, DataTransformer> = new Map;
transformers.forEach((transformer:DataTransformer) => transformersMap.set(transformer.type, transformer));

export class DataTransformersService{
	static parse(type:DataEntityType, value:any):any{
		let transformer:DataTransformer = transformersMap.get(type);
		return transformer ? transformer.parse(value) : value;
	}

	static serialize(type:DataEntityType, value:any):any{
		let transformer:DataTransformer = transformersMap.get(type);
		return transformer ? transformer.serialize(value) : value;
	}
}

export interface DataTransformer{
	type:any,
	parse:Function,
	serialize:Function
}
