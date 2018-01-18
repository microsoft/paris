export declare class DataTransformersService {
    static parse(type: Function, value: any): any;
    static serialize(type: Function, value: any): any;
}
export interface DataTransformer {
    type: any;
    parse: Function;
    serialize: Function;
}
