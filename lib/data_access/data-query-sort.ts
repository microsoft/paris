export type DataSetOptionsSort = Array<DataQuerySortField>;

export interface DataQuerySortField{
	field:string,
	direction: DataQuerySortDirection
}

export enum DataQuerySortDirection{
	ascending,
	descending
}
