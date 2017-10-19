export declare type DataSetOptionsSort = Array<DataSetOptionsSortField>;
export interface DataSetOptionsSortField {
    field: string;
    direction: DataSetOptionsSortDirection;
}
export declare enum DataSetOptionsSortDirection {
    ascending = 0,
    descending = 1,
}
