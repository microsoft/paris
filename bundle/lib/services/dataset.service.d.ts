import { DataSetOptions } from "../dataset/dataset-options";
import { HttpOptions } from "./http.service";
export declare class DatasetService {
    static dataSetOptionsToHttpOptions(dataSetOptions?: DataSetOptions): HttpOptions;
}
