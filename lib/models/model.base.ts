export class ModelBase{
	$parent?:ModelBase;

	constructor(data?:any){
		if (data) {
			Object.assign(this, data);
		}
	}
}
