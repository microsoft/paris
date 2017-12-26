import { DataEntityType } from "./data-entity.base";
import { ParisConfig } from "../config/paris-config";
export interface Field {
    id?: string;
    name?: string;
    data?: "__self" | string | Array<string>;
    entity?: DataEntityType;
    type?: DataEntityType;
    defaultValue?: any;
    arrayOf?: DataEntityType;
    isArray?: boolean;
    required?: boolean;
    require?: ((data: any, config?: ParisConfig) => any) | string;
    parse?: (fieldData?: any, itemData?: any) => any;
    serialize?: (itemData: any) => any;
}
export declare const FIELD_DATA_SELF = "__self";
export declare type EntityFieldConfigFunctionOrValue = ((data: any, config?: ParisConfig) => string) | string;
