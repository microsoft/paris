import {DataEntityType} from "../entity/data-entity.base";

(<any>global)['Reflect'] = {
	getMetaData: (type:"design:type", entityPrototype: DataEntityType, propertyKey: string | symbol) => String
};
