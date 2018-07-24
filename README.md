# Paris

Paris is a TypeScript library for implementing Domain-Driven Design in web apps.
*Paris, fashion capital of the world, where all the **models** want to be*.

## Usage

First, define an Entity:

```typescript
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
const paris = new Paris();
paris.getItemById(TodoItem, 1).subscribe((todoItem:TodoItem) => {
	console.log("Todo item with ID 1: ", todoItem);
});
```

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


## Releasing

If you are the current maintainer of this NPM package:

1. Create a branch for the release: `git checkout -b release-vxx.xx.xx`
2. Upgrade the package's version in packge.json to the appropriate version. Follow the [SemVer specification](https://semver.org/) to determine the correct version.
3. Make sure your local dependencies are up to date: `npm install`
4. Ensure that tests pass: `npm run test`
5. Create a build: `npm run build`
6. If possible, test the new build with an actual app that uses Paris. It's recommended to use `npm link` for this, to ensure using the exact build from step 4.
7. Make a PR to github.com/Microsoft/paris
8. (After PR approval) merge to master branch
9. Tag and push: `git tag vx.xx.xx; git push --tags`
10. Publish to NPM: `npm publish`
