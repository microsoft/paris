import { EntityFields } from "./entity-fields";
import { Field } from "./entity-field";
import { EntityModelConfigBase } from "../models/entity-config-base.interface";
import { DataEntityConstructor } from "./data-entity.base";
export declare class EntityConfigBase {
    entityConstructor: DataEntityConstructor<any>;
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
    readonly: boolean;
    readonly fieldsArray: Array<Field>;
    values: ReadonlyArray<any>;
    private _valuesMap;
    private readonly valuesMap;
    constructor(config: IEntityConfigBase, entityConstructor: DataEntityConstructor<any>);
    getValueById<T>(valueId: string | number): T;
    hasValue(valueId: string | number): boolean;
}
export interface IEntityConfigBase {
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
    readonly?: boolean;
    values?: Array<EntityModelConfigBase>;
}
