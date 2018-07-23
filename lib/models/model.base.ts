export class ModelBase<TRawData = any>{
	id?:any;
	$parent?:ModelBase;

	constructor(data?:any){
		if (data) {
			Object.assign(this, data);
		}
	}
}
