import {Component} from "@angular/core";
import {DataEntityType} from "../paris/entity/data-entity.base";
import {ActivatedRoute} from "@angular/router";
import {IRepository} from "../paris/repository/repository.interface";
import {RepositoryManagerService} from "../paris/repository/repository-manager.service";
import {DataSet} from "../paris/dataset/dataset";
import {Index} from "../paris/models/index";
import {Field} from "../paris/entity/entity-field";

@Component({
	selector: "entity",
	template: `
		<h1>{{entity.entityConfig.pluralName}}</h1>
		<strong class="error" *ngIf="error; else items" style="color: Red">{{error.message}}</strong>
		<ng-template #items>
			<table *ngIf="repo">
				<thead>
					<tr>
						<th *ngFor="let field of entity.entityConfig.fieldsArray">{{field.name}}</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let item of (repo.allItems$ | async)">
						<td *ngFor="let field of entity.entityConfig.fieldsArray">{{getFieldDisplay(item, field)}}</td>
					</tr>
				</tbody>
			</table>
		</ng-template>
		
		<hr />
		<input [(ngModel)]="newItemName" 
			   [attr.placeholder]="'The name of the new ' + entity.entityConfig.singularName">
		<button (click)="addNew()">Save</button>
	`
})
export class EntityComponent{
	entity:DataEntityType;
	error:any;

	repo:IRepository;

	newItemName:string;

	constructor(route: ActivatedRoute, private repositoriesManagerService: RepositoryManagerService){
		route.params.subscribe(() => {
			if (this.entity = route.snapshot.data['entity']) {
				this.repo = repositoriesManagerService.getRepository(this.entity);
				this.newItemName = `New ${this.entity.entityConfig.singularName}`;
			}
		});
	}

	addNew():void{
		let item = this.repo.createNewItem();
		item.name = this.newItemName;
		this.repo.save(item).toPromise();
	}

	getFieldDisplay(item:Index, field:Field):string{
		let itemFieldValue = item[field.id];
		if (itemFieldValue !== undefined && itemFieldValue !== null) {
			if (itemFieldValue instanceof Array)
				return itemFieldValue.map(member => this.getFieldDisplayValue(member)).join(", ");

			return this.getFieldDisplayValue(itemFieldValue);
		}

		return itemFieldValue || "N/A";
	}

	private getFieldDisplayValue(value:any):string{
		if (!value)
			return "(N/A)";

		if (typeof(value) === "object" && value.name)
			return `[${value.name}]`;

		return value instanceof Date ? value.toLocaleString() : value.toString();
	}
}
