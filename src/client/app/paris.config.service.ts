import {Injectable} from "@angular/core";
import {ParisConfig} from "./paris/config/paris-config";

@Injectable()
export class ParisConfigService implements ParisConfig{
	apiRoot:string = "/api222"
}
