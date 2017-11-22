import { DataSetOptionsSort } from "./data-query-sort";
export interface DataQuery {
    page?: number;
    pageSize?: number;
    sortBy?: DataSetOptionsSort;
    where?: {
        [index: string]: any;
    } | string;
}
