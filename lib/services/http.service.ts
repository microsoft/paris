import {ParisHttpConfig} from "../config/paris-config";
import {Observable} from "rxjs/Observable";

export type RequestMethod = "GET"|"POST"|"PUT"|"PATCH"|"DELETE";

export class Http{
	static get(url:string, options?:HttpOptions, httpConfig?:ParisHttpConfig):Observable<any>{
		return Http.request("GET", url, options, httpConfig);
	}

	static post(url:string, options?:HttpOptions, httpConfig?:ParisHttpConfig):Observable<any>{
		return Http.request("POST", url, options, httpConfig);
	}

	static put(url:string, options?:HttpOptions, httpConfig?:ParisHttpConfig):Observable<any>{
		return Http.request("PUT", url, options, httpConfig);
	}

	static delete(url:string, options?:HttpOptions, httpConfig?:ParisHttpConfig):Observable<any>{
		return Http.request("DELETE", url, options, httpConfig);
	}

	static patch(url:string, options?:HttpOptions, httpConfig?:ParisHttpConfig):Observable<any>{
		return Http.request("PATCH", url, options, httpConfig);
	}

	static request(method:RequestMethod, url:string, options?:HttpOptions, httpConfig?:ParisHttpConfig):Observable<any> {
		let fullUrl:string = options && options.params ? Http.addParamsToUrl(url, options.params, options.separateArrayParams) : url,
			tmpError:Error = new Error(`Failed to ${method} from ${url}.`);

		if (options && options.data) {
			httpConfig = httpConfig || {};
			if (!httpConfig.headers)
				httpConfig.headers = {};

			httpConfig.headers["Content-Type"] = "application/json";
		}

		return Observable.ajax(Object.assign({
			method: method,
			url: fullUrl,
			body: options && options.data
		}, Http.httpOptionsToRequestInit(options, httpConfig)))
			.map(e => e.response)
			.catch(() => { throw tmpError });
	}

	static httpOptionsToRequestInit(options?:HttpOptions, httpConfig?:ParisHttpConfig):RequestInit{
		if (!options && !httpConfig)
			return null;

		let requestOptions:RequestInit = {};

		if (options) {
			if (options.data)
				requestOptions.body = options.data;
		}

		if (httpConfig){
			if (httpConfig.headers)
				requestOptions.headers = httpConfig.headers;
		}

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
