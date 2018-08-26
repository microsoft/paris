import {DataStoreService} from "../../lib/data_access/data-store.service";
import {Http} from "../../lib/data_access/http.service";
import {of} from "rxjs";
import {ParisConfig} from "../../lib/config/paris-config";

describe('DataStore', () => {
	let dataStore:DataStoreService;
	let request:jest.Mock;

	const endpoint = 'todo';
	const apiRoot = '/api';

	const httpOptions = {
		params: {
			id: 1
		},
		data: {
			foo: 'bar'
		}
	};

	const baseUrl = '/base-api';
	const localHttpConfig = { timeout: 1000 };
	const getMethod = 'GET';

	const parisConfig:ParisConfig = {
		apiRoot: apiRoot,
		http: {
			headers: {
				token: 'abcde'
			}
		}
	};

	beforeEach(() => {
		request = jest.fn(() => of({ result: true }));
		dataStore = new DataStoreService(parisConfig);
		Http.request = request;
	});

	describe('Request', () => {
		it ('calls Http.request with the correct parameters (baseUrl)', () => {
			dataStore.request(getMethod, endpoint, httpOptions, baseUrl, localHttpConfig);
			expect(Http.request).toBeCalledWith(getMethod, `${baseUrl}/${endpoint}`, httpOptions, { ...parisConfig.http, ...localHttpConfig });
		});

		it ('calls Http.request with the correct parameters (apiRoot)', () => {
			dataStore.request(getMethod, endpoint, httpOptions, null, localHttpConfig);
			expect(Http.request).toBeCalledWith(getMethod, `${apiRoot}/${endpoint}`, httpOptions, { ...parisConfig.http, ...localHttpConfig });
		});
	});

	describe('Active requests', () => {
		it('returns the same Observable for an active request', () => {
			const data$ = dataStore.request('GET', endpoint, httpOptions);
			const data2$ = dataStore.request('GET', endpoint, httpOptions);

			expect(data$).toBe(data2$);
		});

		it('returns a different Observable if no active request is found', () => {
			const data$ = dataStore.request('GET', endpoint, httpOptions);
			data$.subscribe(() => {
				const data2$ = dataStore.request('GET', endpoint, httpOptions);
				expect(data$).not.toBe(data2$);
			});
		});
	});
});
