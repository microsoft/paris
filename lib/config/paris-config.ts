import {AjaxRequest} from "rxjs/ajax";

export interface ParisConfig{
	apiRoot?:string,
	allItemsProperty?:string,
	entityIdProperty?:string,
	data?:any,
	http?:AjaxRequest
}

export const defaultConfig:ParisConfig = {
	allItemsProperty: "items",
	entityIdProperty: "id"
};
