import { DataEntityType } from "../entity/data-entity.base";
export declare class DataTransformersService {
    static parse(type: DataEntityType, value: any): any;
    static serialize(type: DataEntityType, value: any): any;
}
export interface DataTransformer {
    type: any;
    parse: Function;
    serialize: Function;
}
