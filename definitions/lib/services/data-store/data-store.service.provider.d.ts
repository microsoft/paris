import { HttpClient } from "@angular/common/http";
import { DataStoreService } from "./data-store.service";
import { ParisConfig } from "../../config/paris-config";
export declare let dataStoreServiceFactory: (http: HttpClient, dataStoreOptions: ParisConfig) => DataStoreService;
