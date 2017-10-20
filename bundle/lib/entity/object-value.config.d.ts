import { EntityConfigBase, IEntityConfigBase } from "./entity-config.base";
import { IIdentifiable } from "../models/identifiable.model";
export declare class ModelObjectValue extends EntityConfigBase {
    values: ReadonlyArray<IIdentifiable>;
    private _valuesMap;
    constructor(config: ObjectValueConfig);
    getValueById(valueId: string | number): IIdentifiable;
}
export interface ObjectValueConfig extends IEntityConfigBase {
    values: ReadonlyArray<IIdentifiable>;
}
