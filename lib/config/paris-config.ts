export interface ParisConfig{
	apiRoot?:string,
	allItemsProperty?:string,
	entityIdProperty?:string,
	data?:any,
	http?:ParisHttpConfig
}

export const defaultConfig:ParisConfig = {
	allItemsProperty: "items",
	entityIdProperty: "id"
};

export interface ParisHttpConfig{
	headers?:any
}
