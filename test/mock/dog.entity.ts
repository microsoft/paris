import {Entity} from '../../lib/config/decorators/entity.decorator';
import {Animal} from "./thing.entity";


@Entity({
	singularName: 'Dog',
	pluralName: 'Dogs',
	endpoint: 'things',
})
export class Dog extends Animal {
}
