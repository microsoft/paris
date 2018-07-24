import {EntityId} from "./entity-id.type";

export interface EntityModelConfigBase{
	id:EntityId,
	[index:string]:any
}
