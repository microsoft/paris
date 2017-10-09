import {ChangeDetectionStrategy, Component} from '@angular/core';
import './operators';
import {RepositoryEvent, RepositoryManagerService} from "./paris/repository/repository-manager.service";
import {Repository} from "./paris/repository/repository";
import {TodoItemModel} from "./@model/todo-item.model";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

/**
 * This class represents the main application component.
 */
@Component({
	moduleId: module.id,
	selector: 'todo-app',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
	todoItems$:Observable<Array<TodoItemModel>>;

	private todoRepo:Repository<TodoItemModel>;
	private newTodoItems$:BehaviorSubject<Array<TodoItemModel>> = new BehaviorSubject([]);

	newItemText:string;

	constructor(private repositoriesManagerService: RepositoryManagerService) {
		this.todoRepo = repositoriesManagerService.getRepository(TodoItemModel);

		const getAllItems:Observable<Array<TodoItemModel>> = this.todoRepo.allItems$.do(() => {
			// When new data arrives from the repository, the local items should be cleared,
			// since they already should exist in the data.
			this.newTodoItems$.next([]);
		});

		this.todoItems$ = Observable.combineLatest(getAllItems, this.newTodoItems$.asObservable())
			.map((items:Array<Array<TodoItemModel>>) => items[0].concat(items[1]));
	}

	addNewItem(){
		const newItem:TodoItemModel = new TodoItemModel();
		newItem.text = this.newItemText;

		this.todoRepo.save(newItem).subscribe((newItem:TodoItemModel) => {
			this.newItemText = "";
			this.newTodoItems$.next([...this.newTodoItems$.value, newItem]);
		});
	}
}
