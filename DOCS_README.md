# Paris

Paris is a data management library for webapps, using TypeScript and RxJS to implement Domain-Driven Design.  

*Paris, fashion capital of the world, where all the **models** want to be*.


## Features

- Data API abstraction and standardization - define and use your data easily, in a consistent way.
- Strong-typed - data models are defined as classes with TypeScript
- Full-tree modeling - Paris handles the creation of models and sub-models, essentially creating a model tree.
- Implements Domain-Driven Design - true and tested development methodology that improves collaboration.
- Reactive - all async code is done with Observables.
- Caching - easily cache data (including time-based caching). 


## Usage

First, define an Entity:

```typescript
// todo-item.entity.ts

import { Entity, EntityModelBase } from "@microsoft/paris";

@Entity({
	singularName: "Todo Item",
	pluralName: "Todo Items",
	endpoint: "todo/items"
})
export class TodoItem extends EntityModelBase{
	@EntityField()
	text:string;
	
	@EntityField()
	time:Date;
}
```

The above defines an Entity, which can be used to query the todo/items server endpoint, like this:

```typescript
import { Paris } from "@microsoft/paris";

const paris = new Paris();
paris.getItemById(TodoItem, 1).subscribe((todoItem:TodoItem) => {
	console.log("Todo item with ID 1: ", todoItem);
});
```

## Advanced

Check the [Wiki](https://github.com/Microsoft/paris/wiki) for advanced uses and explanations.

[NPM](https://www.npmjs.com/package/@microsoft/paris) [GitHub](https://github.com/Microsoft/paris)

![logo](https://github.com/Microsoft/paris/blob/master/paris_logo-192x192.png)