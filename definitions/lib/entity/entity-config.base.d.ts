import { EntityFields } from "./entity-fields";
import { Field } from "./entity-field";
export declare abstract class EntityConfigBase {
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
    readonly fieldsArray: Array<Field>;
    constructor(config: IEntityConfigBase);
}
export interface IEntityConfigBase {
    singularName: string;
    pluralName: string;
    fields?: EntityFields;
    idProperty?: string;
}
