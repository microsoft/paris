import {DataAvailability} from "./data-availability.enum";

/**
 * Configuration for fetching data for modeling
 */
export interface DataOptions{
	/**
	 * If true, Paris will first look for cached data, before fetching data from backend.
	 */
	allowCache?:boolean,

	/**
	 * The {DataAvailability} mode for fetching data.
	 */
	availability?: DataAvailability
}

export const defaultDataOptions:DataOptions = {
	allowCache: true,
	availability: DataAvailability.deep
};
