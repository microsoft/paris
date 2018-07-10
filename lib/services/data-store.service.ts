import {ParisConfig} from "../config/paris-config";
import {Http, HttpOptions, RequestMethod} from "./http.service";
import {Observable} from "rxjs";
import {finalize, share, tap} from "rxjs/operators";
import {AjaxRequest} from "rxjs/ajax";

export class DataStoreService{
	private activeRequests:Map<string, Observable<any>> = new Map();

	constructor(private config:ParisConfig){}

	get<T = any>(endpoint:string, data?:HttpOptions, baseUrl?:string, httpConfig?:AjaxRequest):Observable<T>{
		return this.setActiveRequest(this.request<T>("GET", endpoint, data, baseUrl, httpConfig), "GET", endpoint, data);
	}

	save<T = any>(endpoint:string, method:RequestMethod = "POST", data?:HttpOptions, baseUrl?:string, httpConfig?:AjaxRequest):Observable<T>{
		return this.request(method, endpoint, data, baseUrl, httpConfig);
	}

	delete(endpoint:string, data?:HttpOptions, baseUrl?:string, httpConfig?:AjaxRequest):Observable<any>{
		return this.request("DELETE", endpoint, data, baseUrl, httpConfig);
	}

	request<T = any>(method:RequestMethod, endpoint:string, data?:HttpOptions, baseUrl?:string, httpConfig?:AjaxRequest):Observable<T>{
		const fullHttpConfig:AjaxRequest = Object.assign({}, this.config.http, httpConfig);
		return Http.request(method, this.getEndpointUrl(endpoint, baseUrl), data, fullHttpConfig);
	}

	private getEndpointUrl(endpoint:string, baseUrl?:string):string{
		return `${baseUrl || this.config.apiRoot || ""}/${endpoint}`;
	}

	private setActiveRequest(obs:Observable<any>, method:RequestMethod, endpoint:string, data?:RequestData):Observable<any>{
		let activeRequestId:string = DataStoreService.getActiveRequestId(method, endpoint, data),
			existingActiveRequest = this.activeRequests.get(activeRequestId);

		if (existingActiveRequest)
			return existingActiveRequest;
		else {
			let warmObservable: Observable<any> = obs.pipe(
				tap(() => this.activeRequests.delete(activeRequestId),
					err => this.activeRequests.delete(activeRequestId)),
				finalize(() => this.activeRequests.delete(activeRequestId)),
				share()
			);

			this.activeRequests.set(activeRequestId, warmObservable);
			return warmObservable;
		}
	}

	private static getActiveRequestId(method:RequestMethod, endpoint:string, data?:RequestData):string{
		return `${method}__${endpoint}__${data ? JSON.stringify(data) : '|'}`;
	}
}

export interface RequestData{
	[index:string]:any
}
