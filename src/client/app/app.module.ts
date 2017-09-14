import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ParisModule} from "./paris/paris.module";
import {HttpClientModule} from "@angular/common/http";
import {ParisConfig} from "./paris/config/paris-config";

const parisConfig:ParisConfig = {
	apiRoot: "api",
	allItemsProperty: "results"
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
