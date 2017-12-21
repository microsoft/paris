import {ParisConfig} from "../config/paris-config";
import {Http, HttpOptions, RequestMethod} from "./http.service";
import {Observable} from "rxjs/Observable";

export class DataStoreService{
	private activeRequests:Map<string, Observable<any>> = new Map();

	constructor(private config:ParisConfig){}

	get(endpoint:string, data?:HttpOptions, baseUrl?:string):Observable<any>{
		return this.setActiveRequest(Observable.from(Http.get(this.getEndpointUrl(endpoint, baseUrl), data, this.config.http)), "GET", endpoint, data);
	}

	save(endpoint:string, method:RequestMethod = "POST", data?:HttpOptions, baseUrl?:string):Observable<any>{
		return Http.request(method, this.getEndpointUrl(endpoint, baseUrl), data, this.config.http);
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
			let warmObservable: Observable<any> = obs.share();

			obs.finally(() => this.activeRequests.delete(activeRequestId));
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
