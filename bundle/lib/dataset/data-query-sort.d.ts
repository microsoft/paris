export declare type DataSetOptionsSort = Array<DataQuerySortField>;
export interface DataQuerySortField {
    field: string;
    direction: DataQuerySortDirection;
}
export declare enum DataQuerySortDirection {
    ascending = 0,
    descending = 1,
}
