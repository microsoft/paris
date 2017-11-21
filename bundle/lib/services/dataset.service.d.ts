import { DataQuery } from "../dataset/data-query";
import { HttpOptions } from "./http.service";
export declare class DatasetService {
    static queryToHttpOptions(query?: DataQuery): HttpOptions;
}
