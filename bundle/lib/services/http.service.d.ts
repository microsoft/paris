import { ParisHttpConfig } from "../config/paris-config";
import { Observable } from "rxjs/Observable";
export declare class Http {
    static get(url: string, options?: HttpOptions, httpConfig?: ParisHttpConfig): Observable<any>;
    static httpOptionsToRequestInit(options?: HttpOptions, httpConfig?: ParisHttpConfig): RequestInit;
    static addParamsToUrl(url: string, params?: UrlParams): string;
    static getParamsQuery(params: UrlParams): string;
}
export interface HttpOptions {
    data?: any;
    params?: UrlParams;
}
export declare type UrlParams = {
    [index: string]: any;
};
