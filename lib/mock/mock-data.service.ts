import {of} from "rxjs";
import {DataStoreService} from "../services/data-store.service";

export function setMockData(data:any){
	beforeEach(() => {
		DataStoreService.prototype.get = jest.fn(() => of(data));
		DataStoreService.prototype.request = jest.fn(() => of(data));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});
}
