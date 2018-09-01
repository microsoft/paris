import {AjaxRequest} from "rxjs/ajax";

export interface ParisConfig<TConfigData = any>{
	apiRoot?:string,
	allItemsProperty?:string,
	entityIdProperty?:string,
	data?:TConfigData,
	http?:AjaxRequest
}

export const defaultConfig:Partial<ParisConfig> = {
	allItemsProperty: "items",
	entityIdProperty: "id"
};
