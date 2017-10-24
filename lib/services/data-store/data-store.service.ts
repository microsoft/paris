import {Inject, Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {HttpClient} from "@angular/common/http";
import {ParisConfig} from "../../config/paris-config";

@Injectable()
export class DataStoreService{
	private activeRequests:Map<string, Observable<any>> = new Map();

	constructor(private http:HttpClient, @Inject('config') private config:ParisConfig){

	}

	get(endpoint:string, data?:RequestData, baseUrl?:string, ):Observable<any>{
		return this.setActiveRequest(this.http.get(this.getEndpointUrl(endpoint, baseUrl), data), HttpVerb.get, endpoint, data);
	}

	post(endpoint:string, data?:RequestData, baseUrl?:string):Observable<any>{
		return this.http.post(this.getEndpointUrl(endpoint, baseUrl), data);
	}

	private getEndpointUrl(endpoint:string, baseUrl?:string):string{
		return `${baseUrl || this.config.apiRoot}/${endpoint}`;
	}

	private setActiveRequest(obs:Observable<any>, verb:HttpVerb, endpoint:string, data?:RequestData):Observable<any>{
		let activeRequestId:string = this.getActiveRequestId(verb, endpoint, data),
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

	private getActiveRequestId(verb:HttpVerb, endpoint:string, data?:RequestData):string{
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
