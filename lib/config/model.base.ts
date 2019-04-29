export class ModelBase{
	id?:any;
	$parent?:ModelBase;
	_init?: (entityData?:any, rawData?:any) => never;

	constructor(data?:any){
		if (data) {
			Object.assign(this, data);
		}
	}
}
