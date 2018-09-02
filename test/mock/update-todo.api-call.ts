import { ApiCallModel } from "../../lib/api/api-calls/api-call.model";
import { ApiCall } from "../../lib/config/decorators/api-call.decorator";
import { Todo } from "./todo.entity";

@ApiCall({
	name: "Update a todo item",
	endpoint: "update_todo_item",
	method: "POST",
	cache: true,
})
export class UpdateTodoApiCall extends ApiCallModel<Todo, Todo>{
}
