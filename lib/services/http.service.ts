import {Observable} from "rxjs/Observable";
import {AjaxRequest} from "rxjs/observable/dom/AjaxObservable";
import {AjaxError, AjaxResponse} from "rxjs/Rx";
import * as _ from "lodash";

export type RequestMethod = "GET"|"POST"|"PUT"|"PATCH"|"DELETE";
const DEFAULT_TIMEOUT = 60000;

export class Http{
	static get(url:string, options?:HttpOptions, httpConfig?:AjaxRequest):Observable<any>{
		return Http.request("GET", url, options, httpConfig);
	}

	static post(url:string, options?:HttpOptions, httpConfig?:AjaxRequest):Observable<any>{
		return Http.request("POST", url, options, httpConfig);
	}

	static put(url:string, options?:HttpOptions, httpConfig?:AjaxRequest):Observable<any>{
		return Http.request("PUT", url, options, httpConfig);
	}

	static delete(url:string, options?:HttpOptions, httpConfig?:AjaxRequest):Observable<any>{
		return Http.request("DELETE", url, options, httpConfig);
	}

	static patch(url:string, options?:HttpOptions, httpConfig?:AjaxRequest):Observable<any>{
		return Http.request("PATCH", url, options, httpConfig);
	}

	static request(method:RequestMethod, url:string, options?:HttpOptions, httpConfig?:AjaxRequest):Observable<any> {
		let fullUrl:string = options && options.params ? Http.addParamsToUrl(url, options.params, options.separateArrayParams) : url;

		let currentHttpConfig: AjaxRequest = _.clone(httpConfig);

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

		return Observable.ajax(Object.assign({
			method: method,
			url: fullUrl,
			body: options && options.data,
			timeout: DEFAULT_TIMEOUT
		}, Http.httpOptionsToRequestInit(options, currentHttpConfig)))
			.catch((err: AjaxError) => {
				if (err.response && ~['json', 'text', 'arraybuffer', ''].indexOf(err.responseType))
					err.message = err.response;
				else
					err.message = `Failed to ${method} from ${url}. Status code: ${err.status}`;
				throw err
			})
			.map((e: AjaxResponse) => e.response)
	}

	static httpOptionsToRequestInit(options?:HttpOptions, httpConfig?:AjaxRequest):AjaxRequest{
		if (!options && !httpConfig)
			return null;

		let requestOptions:AjaxRequest = Object.assign({}, httpConfig);

		if (options && options.data)
			requestOptions.body = options.data;

		return requestOptions;
	}

	static addParamsToUrl(url:string, params?:UrlParams, separateArrayParams:boolean = false):string{
		if (params && !/\?/.test(url))
			return `${url}?${Http.getParamsQuery(params, separateArrayParams)}`;

		return params && !/\?/.test(url) ? `${url}?${Http.getParamsQuery(params, separateArrayParams)}` : url;
	}

	static getParamsQuery(params:UrlParams, separateArrayParams:boolean = false):string{
		let paramsArray:Array<string> = [];

		for(let param in params){
			let paramValue:any = params[param];
			if (separateArrayParams && paramValue instanceof Array)
				paramsArray = paramsArray.concat(paramValue.map(value => `${param}=${encodeURIComponent(String(value))}`));
			else{
				let value:string = encodeURIComponent(String(params[param]));
				paramsArray.push(`${param}=${value}`);
			}
		}

		return paramsArray.join("&");
	}
}

export interface HttpOptions{
	data?:any,
	params?:UrlParams,
	separateArrayParams?:boolean
}

export type UrlParams = { [index:string]:any };
