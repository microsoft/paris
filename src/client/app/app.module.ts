import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule} from "@angular/common/http";
import {TagComponent} from "./components/tag.component";
import {EntitiesNavComponent} from "./components/entities-nav.component";
import {EntityComponent} from "./components/entity.component";
import {RouterModule} from "@angular/router";
import {EntityResolver} from "./entity-resolver";
import {FormsModule} from "@angular/forms";
import {ParisConfig} from "../../../lib/config/paris-config";
import {ParisModule} from "../../../lib/paris.module";

const parisConfig:ParisConfig = {
	apiRoot: "/api",
	allItemsProperty: "results",
};

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		ParisModule.forRoot(parisConfig),
		RouterModule,
		FormsModule
	],
	declarations: [
		AppComponent
		//TagComponent,
		//EntitiesNavComponent,
		//EntityComponent
	],
	providers: [
		{
			provide: APP_BASE_HREF,
			useValue: '<%= APP_BASE %>'
		},
		EntityResolver
	],
	bootstrap: [AppComponent]

})
export class AppModule {
}
