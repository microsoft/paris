import { ParisHttpConfig } from "../config/paris-config";
import { Observable } from "rxjs/Observable";
export declare type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export declare class Http {
    static get(url: string, options?: HttpOptions, httpConfig?: ParisHttpConfig): Observable<any>;
    static post(url: string, options?: HttpOptions, httpConfig?: ParisHttpConfig): Observable<any>;
    static put(url: string, options?: HttpOptions, httpConfig?: ParisHttpConfig): Observable<any>;
    static delete(url: string, options?: HttpOptions, httpConfig?: ParisHttpConfig): Observable<any>;
    static patch(url: string, options?: HttpOptions, httpConfig?: ParisHttpConfig): Observable<any>;
    static request(method: RequestMethod, url: string, options?: HttpOptions, httpConfig?: ParisHttpConfig): Observable<any>;
    static httpOptionsToRequestInit(options?: HttpOptions, httpConfig?: ParisHttpConfig): RequestInit;
    static addParamsToUrl(url: string, params?: UrlParams, separateArrayParams?: boolean): string;
    static getParamsQuery(params: UrlParams, separateArrayParams?: boolean): string;
}
export interface HttpOptions {
    data?: any;
    params?: UrlParams;
    separateArrayParams?: boolean;
}
export declare type UrlParams = {
    [index: string]: any;
};
