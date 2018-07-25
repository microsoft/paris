import {ApiCall} from "../entity/api-call.decorator";
import {ApiCallModel} from "../models/api-call.model";
import {Todo} from "./todo.entity";

@ApiCall({
	name: "Create a new Todo list",
	endpoint: "create_new_list",
	method: "POST",
	cache: true
})
export class CreateTodoListApiCall extends ApiCallModel<Array<Todo>, string>{
}
