import {ajax, AjaxRequest} from "rxjs/ajax";

export interface ParisConfig<TConfigData = any>{
	apiRoot?:string,
	allItemsProperty?:string,
	entityIdProperty?:string,
	data?:TConfigData,
	http?:AjaxRequest,
	ajaxService?: typeof ajax
}

export const defaultConfig:Partial<ParisConfig> = {
	allItemsProperty: "items",
	entityIdProperty: "id"
};
