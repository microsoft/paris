import { ParisConfig } from "../config/paris-config";
import { HttpOptions, RequestMethod } from "./http.service";
import { Observable } from "rxjs/Observable";
export declare class DataStoreService {
    private config;
    private activeRequests;
    constructor(config: ParisConfig);
    get(endpoint: string, data?: HttpOptions, baseUrl?: string): Observable<any>;
    save(endpoint: string, method?: RequestMethod, data?: HttpOptions, baseUrl?: string): Observable<any>;
    delete(endpoint: string, data?: HttpOptions, baseUrl?: string): Observable<any>;
    private getEndpointUrl(endpoint, baseUrl?);
    private setActiveRequest(obs, method, endpoint, data?);
    private static getActiveRequestId(method, endpoint, data?);
}
export interface RequestData {
    [index: string]: any;
}
