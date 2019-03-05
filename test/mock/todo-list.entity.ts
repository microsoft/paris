import {EntityModelBase} from "../../lib/config/entity-model.base";
import {Entity} from "../../lib/config/decorators/entity.decorator";
import {EntityField} from "../../lib/config/decorators/entity-field.decorator";
import {ParisConfig} from "../../lib/config/paris-config";
import {TodoListState} from "./todo-list-state.value-object";

@Entity({
	singularName: "Todo list",
	pluralName: "Todo lists",
	endpoint: (config:ParisConfig<MockConfigData>) => `v${config.data.version}/list`,
	customHeaders: ({"headerKey": "headerValue"}),
	parseDataSet: (rawDataSet:TodoListRawDataSet) => ({
		items: rawDataSet.lists,
		next: rawDataSet.$nextPage,
		count: rawDataSet.total,
		meta: {
			lastUpdate: new Date(rawDataSet.lastUpdate)
		}
	}),
	cache: {
		time: 200
	}
})
export class TodoList extends EntityModelBase<number>{
	@EntityField()
	name:string;

	@EntityField({ defaultValue: { isDone: false, isShared: true, previousState: null } })
	state:TodoListState;
}

interface TodoListRawDataSet {
	lists: Array<any>,
	$nextPage: string,
	total: number,
	lastUpdate: number
}
