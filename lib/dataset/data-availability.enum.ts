/**
 * The modes for creating sub-models in a model.
 */
export enum DataAvailability{
	/**
	 * All sub-models are created. Those that are not cached in Repositories will be fetched from backend.
	 */
	deep,

	/**
	 * Only sub-models of the requested model are fetched. Sub-models of sub-models won't be fetched from backend.
	 */
	flat,

	/**
	 * Only sub-models that are cached will be created. Data for sub-models won't be fetched from backend.
	 */
	available
}
