import { EntityFields } from "./entity-fields";
import { Field } from "./entity-field";
import { IIdentifiable } from "../models/identifiable.model";
import { DataEntityConstructor } from "./data-entity.base";
export declare class EntityConfigBase {
    entityConstructor: DataEntityConstructor<any>;
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
    readonly fieldsArray: Array<Field>;
    values: ReadonlyArray<IIdentifiable>;
    private _valuesMap;
    private readonly valuesMap;
    constructor(config: IEntityConfigBase, entityConstructor: DataEntityConstructor<any>);
    getValueById(valueId: string | number): IIdentifiable;
    hasValue(valueId: string | number): boolean;
}
export interface IEntityConfigBase {
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
    values?: Array<IIdentifiable>;
}
