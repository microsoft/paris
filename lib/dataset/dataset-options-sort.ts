export type DataSetOptionsSort = Array<DataSetOptionsSortField>;

export interface DataSetOptionsSortField{
	field:string,
	direction: DataSetOptionsSortDirection
}

export enum DataSetOptionsSortDirection{
	ascending,
	descending
}
