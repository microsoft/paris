import {DataSetOptions} from "../dataset/dataset-options";
import {HttpOptions} from "./http.service";
import {DataSetOptionsSortDirection, DataSetOptionsSortField} from "../dataset/dataset-options-sort";

export class DatasetService{
	static dataSetOptionsToHttpOptions(dataSetOptions?:DataSetOptions):HttpOptions{
		if (!dataSetOptions)
			return null;

		let httpOptions:HttpOptions = {};

		if (dataSetOptions.params){
			httpOptions.params = {};
			if (dataSetOptions.params.pageSize && dataSetOptions.params.pageSize > 0)
				httpOptions.params.pagesize = dataSetOptions.params.pageSize;

			if (dataSetOptions.params.page && dataSetOptions.params.page > 1)
				httpOptions.params.page = dataSetOptions.params.page;

			if (dataSetOptions.params.sortBy) {
				httpOptions.params.sortBy = dataSetOptions.params.sortBy.map((sortField: DataSetOptionsSortField) => {
					return `${sortField.direction === DataSetOptionsSortDirection.descending ? '-' : ''}${sortField.field}`;
				}).join(",");
			}

			if (dataSetOptions.params.query)
				Object.assign(httpOptions.params, dataSetOptions.params.query);
		}

		if (dataSetOptions.data)
			httpOptions.data = dataSetOptions.data;

		return httpOptions;
	}
}
