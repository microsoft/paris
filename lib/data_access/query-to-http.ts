import {DataQuery} from "./data-query";
import {HttpOptions} from "./http.service";
import {DataQuerySortDirection, DataQuerySortField} from "./data-query-sort";

export function queryToHttpOptions(query?: DataQuery): HttpOptions {
	if (!query)
		return null;

	let httpOptions: HttpOptions = {};

	httpOptions.params = {};
	if (query.pageSize && query.pageSize > 0)
		httpOptions.params.pagesize = query.pageSize;

	if (query.page && query.page > 1)
		httpOptions.params.page = query.page;

	if (query.sortBy) {
		httpOptions.params.sortBy = query.sortBy.map((sortField: DataQuerySortField) => {
			return `${sortField.direction === DataQuerySortDirection.descending ? '-' : ''}${sortField.field}`;
		}).join(",");
	}

	if (query.where)
		Object.assign(httpOptions.params, query.where);

	return httpOptions;
}
