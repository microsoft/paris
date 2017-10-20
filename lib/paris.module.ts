import "./operators";
import {ModuleWithProviders, NgModule} from "@angular/core";
import {RepositoryManagerService} from "./repository/repository-manager.service";
import {HttpClientModule} from "@angular/common/http";
import {DataStoreService} from "./services/data-store/data-store.service";
import {defaultConfig, ParisConfig} from "./config/paris-config";

@NgModule({
	imports: [ HttpClientModule ],
	providers: [
		RepositoryManagerService,
		DataStoreService
	]
})
export class ParisModule {
	static forRoot(config: ParisConfig): ModuleWithProviders {
		return {
			ngModule: ParisModule,
			providers: [
				RepositoryManagerService,
				{ provide: 'config', useValue: Object.assign({}, defaultConfig, config) }
			]
		};
	}
}
