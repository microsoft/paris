import { Observable } from "rxjs";
import { ajax, AjaxError, AjaxRequest, AjaxResponse } from "rxjs/ajax";
import { catchError, map } from "rxjs/operators";
import { clone } from "lodash-es";
import { AjaxService } from "../config/paris-config";

export type SaveRequestMethod = "POST" | "PUT" | "PATCH";
export type RequestMethod = "GET" | "DELETE" | SaveRequestMethod;
const DEFAULT_TIMEOUT = 60000;

export class Http {
	constructor(private ajaxService?: AjaxService) {
	}

	get(url: string, options?: HttpOptions, httpConfig?: AjaxRequest): Observable<any> {
		return this.request("GET", url, options, httpConfig);
	}

	post(url: string, options?: HttpOptions, httpConfig?: AjaxRequest): Observable<any> {
		return this.request("POST", url, options, httpConfig);
	}

	put(url: string, options?: HttpOptions, httpConfig?: AjaxRequest): Observable<any> {
		return this.request("PUT", url, options, httpConfig);
	}

	delete(url: string, options?: HttpOptions, httpConfig?: AjaxRequest): Observable<any> {
		return this.request("DELETE", url, options, httpConfig);
	}

	patch(url: string, options?: HttpOptions, httpConfig?: AjaxRequest): Observable<any> {
		return this.request("PATCH", url, options, httpConfig);
	}

	request<T = any>(method: RequestMethod, url: string, options?: HttpOptions, httpConfig?: AjaxRequest): Observable<any> {
		let fullUrl: string = options && options.params ? Http.addParamsToUrl(url, options.params, options.separateArrayParams) : url;

		let currentHttpConfig: AjaxRequest = clone(httpConfig);

		if (options && options.data) {
			currentHttpConfig = currentHttpConfig || {};
			if (!currentHttpConfig.headers)
				currentHttpConfig.headers = {};

			// remove content type so the browser sets it automatically. this is required for multipart forms
			if (options.data instanceof FormData)
				delete (<any>currentHttpConfig.headers)["Content-Type"];
			else
				(<any>currentHttpConfig.headers)["Content-Type"] = "application/json";
		}

		return (this.ajaxService || ajax)(Object.assign({
			method: method,
			url: fullUrl,
			body: options && options.data,
			timeout: currentHttpConfig && currentHttpConfig.timeout || DEFAULT_TIMEOUT
		}, Http.httpOptionsToRequestInit(options, currentHttpConfig)))
			.pipe(
				catchError((err: AjaxError) => {
					if (err.response && ~['json', 'text', 'arraybuffer', ''].indexOf(err.responseType))
						err.message = err.response;
					else
						err.message = `Failed to ${method} from ${url}. Status code: ${err.status}`;
					throw err;
				}),
				map((e: AjaxResponse) => e.response)
			)
	}

	static httpOptionsToRequestInit(options?: HttpOptions, httpConfig?: AjaxRequest): AjaxRequest {
		if (!options && !httpConfig)
			return null;

		let requestOptions: AjaxRequest = Object.assign({}, httpConfig);

		if (options && options.data)
			requestOptions.body = options.data;

		//handle custom headers
		if (options && options.customHeaders){
			const headers = {...options.customHeaders, ...requestOptions.headers};
			return {...requestOptions, headers };
		}
		return requestOptions;
	}

	static addParamsToUrl(url: string, params?: UrlParams, separateArrayParams: boolean = false): string {
		if (params && !/\?/.test(url))
			return `${url}?${Http.getParamsQuery(params, separateArrayParams)}`;

		return params && !/\?/.test(url) ? `${url}?${Http.getParamsQuery(params, separateArrayParams)}` : url;
	}

	static getParamsQuery(params: UrlParams, separateArrayParams: boolean = false): string {
		let paramsArray: Array<string> = [];

		for (let param in params) {
			let paramValue: any = params[param];
			if (separateArrayParams && paramValue instanceof Array)
				paramsArray = paramsArray.concat(paramValue.map(value => `${param}=${encodeURIComponent(String(value))}`));
			else {
				let value: string = encodeURIComponent(String(params[param]));
				paramsArray.push(`${param}=${value}`);
			}
		}

		return paramsArray.join("&");
	}
}

export interface HttpOptions<T = any, U = UrlParams> {
	data?: T,
	customHeaders?: Record<string,string>,
	params?: U,
	separateArrayParams?: boolean,
	timeout?: number
}

export type UrlParams = { [index: string]: any };
