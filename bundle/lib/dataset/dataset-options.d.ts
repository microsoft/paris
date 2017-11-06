import { DataSetOptionsSort } from "./dataset-options-sort";
export interface DataSetOptions {
    params?: {
        page?: number;
        pageSize?: number;
        sortBy?: DataSetOptionsSort;
        query?: {
            [index: string]: any;
        } | string;
    };
    data?: any;
}
