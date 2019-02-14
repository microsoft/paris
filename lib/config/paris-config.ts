import { AjaxRequest, AjaxResponse } from "rxjs/ajax";
import { Observable } from "rxjs";
import { ParisConfig } from "../main";

export interface AjaxService {
	(urlOrRequest: string | AjaxRequest): Observable<AjaxResponse>;
}

export interface ParisConfigParisConfig<TConfigData = any> {
	apiRoot?: string,
	allItemsProperty?: string,
	entityIdProperty?: string,
	data?: TConfigData,
	http?: AjaxRequest,
	ajaxService?: AjaxService
}

export const defaultConfig: Partial<ParisConfig> = {
	allItemsProperty: "items",
	entityIdProperty: "id"
};
