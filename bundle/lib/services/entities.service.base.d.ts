import { DataEntityType } from "../entity/data-entity.base";
import { EntityConfigBase } from "../entity/entity-config.base";
export declare abstract class EntitiesServiceBase<T extends EntityConfigBase> {
    protected _allEntities: Map<DataEntityType, T>;
    protected _allEntitiesByName: Map<string, T>;
    readonly allEntities: Array<T>;
    getEntityByType(dataEntityType: DataEntityType): T;
    getEntityByName(entitySingularName: string): T;
    addEntity(dataEntityType: DataEntityType, entity: T): T;
    private getDataEntityTypeFields(dataEntityType);
}
