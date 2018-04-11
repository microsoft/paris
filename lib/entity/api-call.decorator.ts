import {ApiCallConfig, ApiCallType} from "../models/api-call.model";

export function ApiCall(config:ApiCallConfig){
	return (target:ApiCallType) => {
		target.config = config;
	}
}
