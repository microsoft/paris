import { ModelBase } from "./model.base";
import { EntityModelConfigBase } from "./entity-config-base.interface";
export declare class EntityModelBase extends ModelBase {
    id: string | number;
    readonly isNew: boolean;
    constructor(data: EntityModelConfigBase);
}
