import {ApiCallConfig, ApiCallType} from "../../api/api-calls/api-call.model";

export function ApiCall(config:ApiCallConfig){
	return (target:ApiCallType) => {
		target.config = config;
	}
}
