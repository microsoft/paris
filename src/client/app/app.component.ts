import {Component} from '@angular/core';
import './operators';
import {RepositoryEvent, RepositoryManagerService} from "./paris/repository/repository-manager.service";
import {AlertModel} from "./@model/alert.model";
import {MachineModel} from "./@model/machine.model";
import {Repository} from "./paris/repository/repository";
import {DataSet} from "./paris/dataset/dataset";
import {Immutability} from "./paris/services/immutability";

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
	alerts:Array<AlertModel>;

	private alertsRepo:Repository<AlertModel>;

	constructor(private repositoriesManagerService: RepositoryManagerService) {
		this.alertsRepo = repositoriesManagerService.getRepository(AlertModel);

		repositoriesManagerService.save$.subscribe((e:RepositoryEvent) => {
			console.log(`Saved new ${e.repository.entity.singularName}`);
		});

		this.loadAll();
	}

	loadAll(){
		this.loadAlert();
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
			}, error => console.error("ERROR", error));
	}

	saveAlert(){
		let editedAlert:AlertModel = Immutability.unfreeze(this.alert);
		editedAlert.name = "Updated Alert!";
		this.alertsRepo.save(editedAlert).subscribe((savedAlert:AlertModel) => {
			console.log("SAVED", savedAlert);
			this.alert = savedAlert;
		})
	}
}
