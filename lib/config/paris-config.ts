export interface ParisConfig{
	apiRoot?:string,
	allItemsProperty?:string,
	entityIdProperty?:string,
	data?:any
}

export const defaultConfig:ParisConfig = {
	allItemsProperty: "items",
	entityIdProperty: "id"
};
