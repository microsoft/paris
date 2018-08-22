export class ErrorsService{
	static warn(...items:Array<any>):void{
		return console && console.warn.apply(console, ["Paris warning: ", ...items]);
	}
}
