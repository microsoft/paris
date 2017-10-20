import { DataEntityType } from "../entity/data-entity.base";
import { EntityFields } from "../entity/entity-fields";
import { Field } from "../entity/entity-field";
export declare class EntityFieldsService {
    protected fields: Map<DataEntityType, EntityFields>;
    addField(dataEntityType: DataEntityType, field: Field): void;
    getDataTypeFields(dataEntityType: DataEntityType): EntityFields;
}
export declare const entityFieldsService: EntityFieldsService;
