import {ChangeDetectionStrategy, Component} from "@angular/core";
import {entitiesService} from "../paris/services/entities.service";
import {DataEntityType} from "../paris/entity/data-entity.base";
import {ModelEntity} from "../paris/entity/entity.config";

@Component({
	selector: "entities-nav",
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<nav>
			<a *ngFor="let entity of entities" 
			   [routerLink]="['entity', entity.pluralName]">
				{{entity.pluralName}}
			</a>
		</nav>
	`
})
export class EntitiesNavComponent{
	entities:Array<ModelEntity> = entitiesService.allEntities;
}
