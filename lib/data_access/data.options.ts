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
	 * If true, the entity fields parsing will be case insensitive.
	 * e.g, a value for a field named "ProviderName" will be parsed into fields: "providerName", "providername", "ProviderName", "PROVIDERNAME",
	 * and any other class field that satisfies field.toLowerCase() === "ProviderName".toLowerCase().
	 * This logic is applied recursively to all sub-entities as well (fields of the entity that are objects themselves, and their sub-entities, and so on).
	 * Notice that casing of fields on the raw "fieldData" object passed to the entity's "parse" function, will remain as is.
	 * @default false
	 */
	ignoreFieldsCasing?:boolean,

	/**
	 * The {DataAvailability} mode for fetching data.
	 */
	availability?: DataAvailability
}

export const defaultDataOptions:DataOptions = {
	allowCache: true,
	availability: DataAvailability.deep
};
