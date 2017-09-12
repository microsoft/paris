import {HttpClient} from "@angular/common/http";
import {DataStoreService} from "./data-store.service";
import {ParisConfig} from "../../config/paris-config";

export let dataStoreServiceFactory = (http: HttpClient, dataStoreOptions: ParisConfig) => {
	return new DataStoreService(http, Object.assign({}, defaultDataStoreOptions, dataStoreOptions));
};

const defaultDataStoreOptions:ParisConfig = {
	apiRoot: "/",
	allItemsProperty: "items"
};
