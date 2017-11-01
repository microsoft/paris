import {DataAvailability} from "./data-availability.enum";

export interface DataOptions{
	allowCache?:boolean,
	availability?: DataAvailability
}

export const defaultDataOptions:DataOptions = {
	allowCache: true,
	availability: DataAvailability.deep
};
