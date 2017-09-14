import {Component} from '@angular/core';
import './operators';
import {RepositoryManagerService} from "./paris/repository/repository-manager.service";
import {AlertModel} from "./@model/alert.model";
import {MachineModel} from "./@model/machine.model";
import {Repository} from "./paris/repository/repository";
import {DataSet} from "./paris/dataset/dataset";

/**
 * This class represents the main application component.
 */
@Component({
	moduleId: module.id,
	selector: 'sd-app',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.css'],
})
export class AppComponent {
	alert:AlertModel;
	machine:MachineModel;
	alerts:Array<AlertModel>;

	constructor(repositoriesManagerService: RepositoryManagerService) {
		let alertsRepo:Repository<AlertModel> = repositoriesManagerService.getRepository(AlertModel);
		alertsRepo.getItemById("123")
			.subscribe((alert:AlertModel) => {
				console.log("alert: ", alert);
				this.alert = alert;
			}, error => console.error("ERROR", error));

		alertsRepo.getItemsDataSet({ page: 1, pageSize: 15 }).subscribe((alerts:DataSet<AlertModel>) => {
			console.log("Alerts: ", alerts);
			this.alerts = alerts.items;
		});

		let machinesRepo:Repository<MachineModel> = repositoriesManagerService.getRepository(MachineModel);

		machinesRepo.getItemById("yossi-pc")
			.subscribe((machine:MachineModel) => console.log("Machine: ", machine));
	}
}
