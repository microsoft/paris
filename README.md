# Paris

Paris is a data management library for webapps, using TypeScript and RxJS to implement Domain-Driven Design.

*Paris, fashion capital of the world, where all the **models** want to be*.


## Installation

*Package size: ~15.8kb (gzipped)*

1. Paris is a TypeScript library and also requires RxJs and lodash, so you'll need both those packages, if you don't already use them:

	```
	npm install --save lodash-es rxjs typescript
	```

2. Install the Paris NPM package:

	```
	npm install --save @microsoft/paris
	```

## Features

- Data API abstraction and standardization - define and use your data easily, in a consistent way.
- Strong-typed - data models are defined as classes with TypeScript
- Full-tree modeling - Paris handles the creation of models and sub-models, essentially creating a model tree.
- Implements Domain-Driven Design - true and tested development methodology that improves collaboration.
- Reactive - all async code is done with RxJS Observables.
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
	text: string;

	@EntityField()
	time: Date;
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

Check the [Source Typescript models](https://microsoft.github.io/paris/) for a detailed look under the hood.

[NPM](https://www.npmjs.com/package/@microsoft/paris) [GitHub](https://github.com/Microsoft/paris)


## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Testing
* Unit tests are written using [Jest](https://jestjs.io/), and executed with [ts-jest](https://github.com/kulshekhar/ts-jest).