import { DataEntityType } from "../entity/data-entity.base";
import { EntityConfigBase } from "../entity/entity-config.base";
export declare abstract class EntitiesServiceBase<T extends EntityConfigBase> {
    protected _allEntities: Map<DataEntityType, T>;
    readonly allEntities: Array<T>;
    getEntityByType(dataEntityType: DataEntityType): T;
    addEntity(dataEntityType: DataEntityType, entity: T): T;
    getEntityByPluralName(pluralName: string): DataEntityType;
    private getDataEntityTypeFields(dataEntityType);
}
