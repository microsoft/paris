import {ParisConfig} from "../config/paris-config";
import {Http, HttpOptions, RequestMethod} from "./http.service";
import {Observable} from "rxjs";
import {finalize, share} from "rxjs/operators";

export class DataStoreService{
	private activeRequests:Map<string, Observable<any>> = new Map();

	constructor(private config:ParisConfig){}

	get<T = any>(endpoint:string, data?:HttpOptions, baseUrl?:string):Observable<T>{
		return this.request<T>("GET", endpoint, data, baseUrl);
	}

	save<T = any>(endpoint:string, method:RequestMethod = "POST", data?:HttpOptions, baseUrl?:string):Observable<T>{
		return Http.request(method, this.getEndpointUrl(endpoint, baseUrl), data, this.config.http);
	}

	delete(endpoint:string, data?:HttpOptions, baseUrl?:string):Observable<any>{
		return Http.request("DELETE", this.getEndpointUrl(endpoint, baseUrl), data, this.config.http);
	}

	request<T = any>(method:RequestMethod, endpoint:string, data?:HttpOptions,baseUrl?:string):Observable<T>{
		return this.setActiveRequest(Http.request(method, this.getEndpointUrl(endpoint, baseUrl), data, this.config.http), method, endpoint, data);
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
