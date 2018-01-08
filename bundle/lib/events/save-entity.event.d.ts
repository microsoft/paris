import { EntityEvent } from "./entity.event";
export interface SaveEntityEvent extends EntityEvent {
    newValue: any;
    previousValue?: any;
    isNew: boolean;
}
