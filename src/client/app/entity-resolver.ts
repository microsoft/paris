import {DataEntityType} from "./paris/entity/data-entity.base";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {entitiesService} from "./paris/services/entities.service";

@Injectable()
export class EntityResolver implements Resolve<DataEntityType> {
	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): DataEntityType {
		return entitiesService.getEntityByPluralName(route.params.entityPluralName);
	}
}
