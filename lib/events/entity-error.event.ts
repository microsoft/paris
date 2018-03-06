import {EntityEvent} from "./entity.event";

export interface EntityErrorEvent extends EntityEvent {
	type: EntityErrorTypes,
	originalError: any
}

export enum EntityErrorTypes {
	HttpError,
	DataParseError
}
