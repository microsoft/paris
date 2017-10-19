import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ParisConfig } from "../../config/paris-config";
export declare class DataStoreService {
    private http;
    private config;
    private activeRequests;
    constructor(http: HttpClient, config: ParisConfig);
    get(endpoint: string, data?: RequestData): Observable<any>;
    post(endpoint: string, data?: RequestData): Observable<any>;
    private getEndpointUrl(endpoint);
    private setActiveRequest(obs, verb, endpoint, data?);
    private getActiveRequestId(verb, endpoint, data?);
}
export interface RequestData {
    [index: string]: any;
}
