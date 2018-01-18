import { EntityFields } from "./entity-fields";
import { Field } from "./entity-field";
import { DataEntityConstructor } from "./data-entity.base";
export declare class EntityConfigBase implements IEntityConfigBase {
    entityConstructor: DataEntityConstructor<any>;
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
    readonly: boolean;
    readonly fieldsArray: Array<Field>;
    values: Array<any>;
    private _valuesMap;
    private readonly valuesMap;
    constructor(config: IEntityConfigBase, entityConstructor: DataEntityConstructor<any>);
    getValueById<T>(valueId: string | number): T;
    getDefaultValue<T>(): T;
    hasValue(valueId: string | number): boolean;
}
export interface IEntityConfigBase {
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
    readonly?: boolean;
    values?: Array<any>;
    fieldsArray?: Array<Field>;
    hasValue?: (valueId: string | number) => boolean;
    getDefaultValue?: () => any;
    getValueById?: (valueId: string | number) => any;
    entityConstructor?: DataEntityConstructor<any>;
}
