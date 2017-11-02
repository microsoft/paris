export interface ParisConfig {
    apiRoot?: string;
    allItemsProperty?: string;
    entityIdProperty?: string;
    data?: any;
    http?: ParisHttpConfig;
}
export declare const defaultConfig: ParisConfig;
export interface ParisHttpConfig {
    headers?: any;
}
