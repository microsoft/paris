import { AjaxRequest } from "rxjs/observable/dom/AjaxObservable";
export interface ParisConfig {
    apiRoot?: string;
    allItemsProperty?: string;
    entityIdProperty?: string;
    data?: any;
    http?: AjaxRequest;
}
export declare const defaultConfig: ParisConfig;
