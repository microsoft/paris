import {EntityEvent} from "./entity.event";

export interface RemoveEntitiesEvent extends EntityEvent{
	items:Array<any>
}
