import {EntityModelBase} from "../models/entity-model.base";
import {Entity} from "../entity/entity.decorator";
import {EntityField} from "../entity/entity-field.decorator";

@Entity({
	singularName: "Todo list",
	pluralName: "Todo lists",
	endpoint: "list",
	parseDataSet: (rawDataSet:TodoListRawDataSet) => ({
		items: rawDataSet.lists,
		next: rawDataSet.$nextPage,
		count: rawDataSet.total,
		meta: {
			lastUpdate: new Date(rawDataSet.lastUpdate)
		}
	})
})
export class TodoList extends EntityModelBase<number>{
	@EntityField()
	name:string;
}

interface TodoListRawDataSet {
	lists: Array<any>,
	$nextPage: string,
	total: number,
	lastUpdate: number
}
