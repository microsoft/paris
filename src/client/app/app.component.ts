import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TodoItemModel} from "./@model/todo-item.model";
import {Observable} from "rxjs";
import {Repository} from "../../../lib/repository/repository";
import {RepositoryManagerService} from "../../../lib/repository/repository-manager.service";
import {ProtectionLevel} from "./@model/atp/protection-levels/protection-level.entity";

/**
 * This class represents the main application component.
 */
@Component({
	moduleId: module.id,
	selector: 'todo-app',
	template: ''
})
export class AppComponent {
	todoItems$:Observable<Array<TodoItemModel>>;

	// private todoRepo:Repository<TodoItemModel>;
	// private newTodoItems$:BehaviorSubject<Array<TodoItemModel>> = new BehaviorSubject([]);

	newItemText:string;

	constructor(private repositoryManagerService: RepositoryManagerService) {
		const repo:Repository<ProtectionLevel> = repositoryManagerService.getRepository(ProtectionLevel);
		repo.allItems$.subscribe(items => console.log("items", items))

		// this.todoRepo = repositoriesManagerService.getRepository(TodoItemModel);
		//
		// const getAllItems:Observable<Array<TodoItemModel>> = this.todoRepo.allItems$.do(() => {
		// 	// When new data arrives from the repository, the local items should be cleared,
		// 	// since they already should exist in the data.
		// 	this.newTodoItems$.next([]);
		// });
		//
		// this.todoItems$ = Observable.combineLatest(getAllItems, this.newTodoItems$.asObservable())
		// 	.map((items:Array<Array<TodoItemModel>>) => items[0].concat(items[1]));
	}
	//
	// addNewItem(){
	// 	const newItem:TodoItemModel = new TodoItemModel();
	//
	// 	newItem.text = this.newItemText;
	// 	this.newItemText = "";
	// 	this.newTodoItems$.next([...this.newTodoItems$.value, newItem]);
	//
	// 	this.todoRepo.save(newItem).subscribe((savedNewItem:TodoItemModel) => {
	// 		this.newTodoItems$.next([...this.newTodoItems$.value.slice(0, -1), savedNewItem]);
	// 	});
	// }
}
