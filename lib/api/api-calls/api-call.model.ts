import {ApiCallBackendConfigInterface} from "../../config/api-call-backend-config.interface";
import {HttpOptions, RequestMethod} from "../../data_access/http.service";
import { ParisConfig } from "../../..";
import { Dictionary } from "lodash";

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
	responseType?: 'json' | 'blob' | 'text',
	timeout?:number,
	type?:{ new():TResult }
}
