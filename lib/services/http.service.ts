import {ParisHttpConfig} from "../config/paris-config";
import {Observable} from "rxjs/Observable";

export class Http{
	static get(url:string, options:HttpOptions, httpConfig?:ParisHttpConfig):Observable<any>{
		let fullUrl:string = Http.addParamsToUrl(url),
			tmpError:Error = new Error(`Failed to GET from ${url}.`);

		return Observable.ajax(Object.assign({
			url: fullUrl
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

	static addParamsToUrl(url:string, params?:UrlParams):string{
		if (params && !/\?/.test(url))
			return `${url}?${Http.getParamsQuery(params)}`;

		return params && !/\?/.test(url) ? `${url}?${Http.getParamsQuery(params)}` : url;
	}

	static getParamsQuery(params:UrlParams):string{
		let paramsArray:Array<string> = [];

		for(let param in params){
			let value:string = encodeURIComponent(String(params[param]));
			paramsArray.push(`${param}=${value}`);
		}

		return paramsArray.join("&");
	}
}

export interface HttpOptions{
	data?:any,
	params?:UrlParams
}

export type UrlParams = { [index:string]:any };
