import {Component} from "@angular/core";
import {DataEntityType} from "../paris/entity/data-entity.base";
import {ActivatedRoute} from "@angular/router";
import {IRepository} from "../paris/repository/repository.interface";
import {RepositoryManagerService} from "../paris/repository/repository-manager.service";
import {DataSet} from "../paris/dataset/dataset";
import {Index} from "../paris/models/index";
import {Field} from "../paris/entity/entity-field";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
	selector: "entity",
	template: `
		<h1>{{entity.entityConfig.pluralName}}</h1>
		<strong class="error" *ngIf="error; else items" style="color: Red">{{error.message}}</strong>
		<ng-template #items>
			<table *ngIf="allItems">
				<thead>
					<tr>
						<th *ngFor="let field of entity.entityConfig.fieldsArray">{{field.name}}</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let item of allItems.items">
						<td *ngFor="let field of entity.entityConfig.fieldsArray">{{getFieldDisplay(item, field)}}</td>
					</tr>
				</tbody>
			</table>
		</ng-template>
	`
})
export class EntityComponent{
	entity:DataEntityType;
	allItems:DataSet<any>;
	error:any;

	private repo:IRepository;

	constructor(route: ActivatedRoute, private repositoriesManagerService: RepositoryManagerService){
		route.params.subscribe(() => {
			if (this.entity = route.snapshot.data['entity']) {
				this.repo = repositoriesManagerService.getRepository(this.entity);
				this.updateAll();
			}
		});
	}

	private updateAll(){
		this.repo.getItemsDataSet({ page: 1, pageSize: 15 }).subscribe((allItemsDataSet:DataSet<any>) => {
			this.allItems = allItemsDataSet;
			this.error = null;
		}, (error:HttpErrorResponse) => {
			console.error(error);
			this.error = error
		});
	}

	getFieldDisplay(item:Index, field:Field):string{
		let itemFieldValue = item[field.id];
		if (itemFieldValue !== undefined && itemFieldValue !== null) {
			if (itemFieldValue instanceof Array)
				return itemFieldValue.map(member => member && member.name || member).join(", ");

			return itemFieldValue.name || itemFieldValue;
		}

		return itemFieldValue || "N/A";
	}
}
