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

	private alertsRepo:Repository<AlertModel>;

	constructor(private repositoriesManagerService: RepositoryManagerService) {
		this.alertsRepo = repositoriesManagerService.getRepository(AlertModel);

		this.loadAll();
	}

	loadAll(){
		this.loadAlert();
		this.loadAlerts();
		this.loadMachine();
	}

	loadMachine(){
		let machinesRepo:Repository<MachineModel> = this.repositoriesManagerService.getRepository(MachineModel);

		machinesRepo.getItemById("yossi-pc")
			.subscribe((machine:MachineModel) => console.log("Machine: ", machine));
	}

	loadAlert(){
		this.alertsRepo.getItemById("123")
			.subscribe((alert:AlertModel) => {
				console.log("alert: ", alert);
				this.alert = alert;

				this.alert.name = "Updated Alert!";
				this.alertsRepo.save(this.alert).subscribe((savedAlert:AlertModel) => console.log("SAVED", savedAlert))
			}, error => console.error("ERROR", error));
	}

	loadAlerts(){
		this.alertsRepo.getItemsDataSet({ page: 1, pageSize: 15 }).subscribe((alerts:DataSet<AlertModel>) => {
			console.log("Alerts: ", alerts);
			this.alerts = alerts.items;
		});
	}
}
