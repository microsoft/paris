import { AjaxRequest, AjaxResponse } from "rxjs/ajax";
import { Observable } from "rxjs";

export interface AjaxService {
	(urlOrRequest: string | AjaxRequest): Observable<AjaxResponse>;
}

export interface ParisConfig<TConfigData = any> {
	apiRoot?: string,
	allItemsProperty?: string,
	entityIdProperty?: string,
	data?: TConfigData,
	http?: AjaxRequest,
	ajaxService?: AjaxService
	intercept?: (req: AjaxRequest) => Observable<AjaxRequest>;
}

export const defaultConfig: Partial<ParisConfig> = {
	allItemsProperty: "items",
	entityIdProperty: "id"
};
