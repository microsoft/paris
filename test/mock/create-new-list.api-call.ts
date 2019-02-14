import {ApiCall} from "../../lib/config/decorators/api-call.decorator";
import {ApiCallModel} from "../../lib/api/api-calls/api-call.model";
import {Todo} from "./todo.entity";

@ApiCall({
	name: "Create a new Todo list",
	endpoint: "create_new_list",
	method: "POST",
	cache: true,
	customHeaders: (config => config.entityIdProperty === 'id' ? ({"testHeader": "testValue"}) : undefined)
})
export class CreateTodoListApiCall extends ApiCallModel<Array<Todo>, string>{
}
