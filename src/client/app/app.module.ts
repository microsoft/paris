import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ParisModule} from "./paris/paris.module";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {DataStoreService} from "./paris/services/data-store/data-store.service";
import {dataStoreServiceFactory} from "./paris/services/data-store/data-store.service.provider";
import {ParisConfigService} from "./paris.config.service";
import {ParisConfig} from "./paris/config/paris-config";

const parisConfig:ParisConfig = {
	apiRoot: "api"
};

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		ParisModule.forRoot(parisConfig)
	],
	declarations: [AppComponent],
	providers: [
		{
			provide: APP_BASE_HREF,
			useValue: '<%= APP_BASE %>'
		}
	],
	bootstrap: [AppComponent]

})
export class AppModule {
}
