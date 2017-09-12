import {ModuleWithProviders, NgModule} from "@angular/core";
import {RepositoryManagerService} from "./repository/repository-manager.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {DataStoreService} from "./services/data-store/data-store.service";
import {dataStoreServiceFactory} from "./services/data-store/data-store.service.provider";
import {ParisConfig} from "./config/paris-config";

@NgModule({
	imports: [ HttpClientModule ],
	providers: [
		RepositoryManagerService,
		DataStoreService
	]
})
export class ParisModule {
	static forRoot(dataStoreOptions: ParisConfig): ModuleWithProviders {
		return {
			ngModule: ParisModule,
			providers: [
				RepositoryManagerService,
				{ provide: 'config', useValue: dataStoreOptions }
			]
		};
	}
}
