export interface ParisConfig{
	apiRoot?:string,
	allItemsProperty?:string,
	entityIdProperty?:string
}

export const defaultConfig:ParisConfig = {
	allItemsProperty: "items",
	entityIdProperty: "$key"
};
