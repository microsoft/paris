import { ParisConfig } from "../config/paris-config";
import { HttpOptions } from "./http.service";
import { Observable } from "rxjs/Observable";
export declare class DataStoreService {
    private config;
    private activeRequests;
    constructor(config: ParisConfig);
    get(endpoint: string, data?: HttpOptions, baseUrl?: string): Observable<any>;
    private getEndpointUrl(endpoint, baseUrl?);
    private setActiveRequest(obs, verb, endpoint, data?);
    private static getActiveRequestId(verb, endpoint, data?);
}
export interface RequestData {
    [index: string]: any;
}
