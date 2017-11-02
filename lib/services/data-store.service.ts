import {ParisConfig} from "../config/paris-config";
import {Http, UrlParams} from "./http.service";
import {Observable} from "rxjs/Observable";

export class DataStoreService{
	private activeRequests:Map<string, Observable<any>> = new Map();

	constructor(private config:ParisConfig){}

	get(endpoint:string, data?:UrlParams, baseUrl?:string):Observable<any>{
		return this.setActiveRequest(Observable.from(Http.get(this.getEndpointUrl(endpoint, baseUrl), data, this.config.http)), HttpVerb.get, endpoint, data);
	}

	// post(endpoint:string, data?:RequestData, baseUrl?:string):Observable<any>{
	// 	return this.http.post(this.getEndpointUrl(endpoint, baseUrl), data);
	// }

	private getEndpointUrl(endpoint:string, baseUrl?:string):string{
		return `${baseUrl || this.config.apiRoot}/${endpoint}`;
	}

	private setActiveRequest(obs:Observable<any>, verb:HttpVerb, endpoint:string, data?:RequestData):Observable<any>{
		let activeRequestId:string = DataStoreService.getActiveRequestId(verb, endpoint, data),
			existingActiveRequest = this.activeRequests.get(activeRequestId);

		if (existingActiveRequest)
			return existingActiveRequest;
		else {
			let warmObservable: Observable<any> = obs.share();

			obs.finally(() => this.activeRequests.delete(activeRequestId));
			this.activeRequests.set(activeRequestId, warmObservable);
			return warmObservable;
		}
	}

	private static getActiveRequestId(verb:HttpVerb, endpoint:string, data?:RequestData):string{
		return `${verb}__${endpoint}__${data ? JSON.stringify(data) : '|'}`;
	}
}

export interface RequestData{
	[index:string]:any
}

enum HttpVerb{
	get = "GET",
	post = "POST"
}
