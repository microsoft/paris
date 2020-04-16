import {EntityField} from '../../lib/config/decorators/entity-field.decorator';
import {Entity} from '../../lib/config/decorators/entity.decorator';
import {EntityModelBase} from '../../lib/config/entity-model.base';

@Entity({
	singularName: 'Thing',
	pluralName: 'Things',
	endpoint: 'things',
	timeout: 20000,
	modelWith: rawData => {
		switch (rawData.type) {
			case 'animal':
				return Animal;
			case 'person':
				return Person;
			case 'thing':
				return null;
			default:
				throw new Error(`Invalid type for 'Thing' (got ${rawData.type})`);
		}
	},
})
export class Thing extends EntityModelBase<number> {
	@EntityField()
	type: 'animal' | 'person';

	@EntityField()
	name: string;
}

@Entity({
	singularName: 'Person',
	pluralName: 'Persons',
	endpoint: 'things',
	modelWith: (_, query) => {
		if (query && query.where && (<{[index: string]: any}>query.where)['fullMoon']){
			return Animal;
		}
		return null;
	}
})
export class Person extends Thing {
	@EntityField()
	address: string;
}

@Entity({
	singularName: 'Animal',
	pluralName: 'Animals',
	endpoint: 'things',
	modelWith: (_, query) => {
		if (query && query.where && (<{ [index: string]: any }>query.where)['isDog']) {
			return 'Dog'
		}
		return null
	}
})
export class Animal extends Thing {
	@EntityField()
	kind: 'dog' | 'cat';
}
