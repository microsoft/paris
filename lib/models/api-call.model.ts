import {ApiCallBackendConfigInterface} from "./api-call-backend-config.interface";
import {HttpOptions, RequestMethod} from "../services/http.service";

export class ApiCallModel<TResult = any, TInput = any>{
	config:ApiCallConfig<TResult, TInput>
}

export interface ApiCallType<TResult = any, TInput = any>{
	new(config?:ApiCallConfig<TResult, TInput>):ApiCallModel<TResult, TInput>;
	config?:ApiCallConfig<TResult, TInput>;
}

export interface ApiCallConfig<TResult = any, TInput = any> extends ApiCallBackendConfigInterface<TResult> {
	name:string,
	parseQuery?:(input:TInput) => HttpOptions,
	parse?:(data?:any, input?:TInput) => TResult,
	method?:RequestMethod,
	timeout?:number,
	type?:{ new():TResult }
}
