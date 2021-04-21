import {DataEntityType} from "../api/entity/data-entity.base";
import {ParisConfig} from "./paris-config";
import {DataQuery} from "../data_access/data-query";

/**
 * Configuration for a model EntityField decorator
 */
export interface FieldConfig{
	/**
	 * An ID for the field. By default, the ID is the property's name.
	 */
	id?:string,

	/**
	 * Optional name to assign to the field. May be used for reflection, debugging, etc.
	 */
	name?:string,

	/**
	 * Optional type constructor to override the type Paris gets from decoratorMetadata. Useful for using Paris without emitDecoratorMetadata
	 */
	type?:any

	/**
	 * Specifies which property in the raw data should be assigned to the model's property.
	 * By default, Paris looks for a property of the same name as the property in the model. i.e:
	 *
	 * If an entity has the following property definition:
	 *
	 * ```typescript
	 * @EntityField()
	 * name:string;
	 * ```
	 *
	 * Then when creating the model, if the raw data contains a `name` property with value 'Anna', the resulting model will have a `name` property with value 'Anna'.
	 *
	 * @example <caption>Mapping from a different raw data property with `data`</caption>
	 * If your raw data has properties in snake-case rather than camel-case, you'd need to map the properties:
	 * ```typescript
	 * @EntityField({ data: "creation_date" })
	 * creationData: Date;
	 * ```
	 * @example <caption>Using the first available value from the raw data for the model's property</caption>
	 * If an array of strings is provided for `data`, Paris will assign to the model's property value the first value from the raw data which isn't undefined or null:
	 * ```typescript
	 * @EntityField({ data: ['creation_date', 'init_date', 'start_date'] })
	 * date: Date;
	 * ```
	 * If the raw data is:
	 * {
	 * 		"creation_date": null,
	 * 		"start_date": 1532422166428
	 * }
	 *
	 * Then the model's `date` property will have a value of Date(1532422166428), since both creation_date and init_date have no value in the data.
	 *
	 * @example <caption>Using '\_\_self' for data to pass the whole raw data</caption>
	 * In the case when we want to separate some properties of the raw data to a sub-model, it's possible to use the special value '__self' for the `data` field configuration.
	 * This passes the whole raw data object to the field's creation, rather than just the value of a property. e.g:
	 * ```typescript
	 * Person extends EntityModelBase{
	 * 		@EntityField()
	 * 		name:string;
	 *
	 * 		@EntityField({ data: '__self' })
	 * 		address:Address;
	 * }
	 * ```
	 * In case we want to separate all address properties from a user into an encapsulated object, for the following raw data:
	 *
	 * ```
	 * {
	 * 		"name": "Anna",
	 * 		"street": "Prinsengracht 263-267",
	 * 		"zip": "1016 GV",
	 * 		"city": "Amsterdam",
	 * 		"country": "Holland"
	 * }
	 * ```
	 */
	data?:"__self" | string | Array<string>,

	/**
	 * A value to assign to the property if the raw data is `null` or undefined.
	 */
	defaultValue?:any,

	/**
	 * `arrayOf` is required when the property's type is an array of a sub-model type.
	 * It's required because the ES6 Reflect-metadata module that Paris uses to infer the types of properties doesn't support generics.
	 *
	 * @example <caption>Using a model field's arrayOf configuration for assigning an array sub-model</caption>
	 * // Without the arrayOf, addresses won't be modeled by Paris.
	 * ```typescript
	 * @EntityField({ arrayOf: Address })
	 * addresses: Array<Address>
	 * ```
	 */
	arrayOf?:DataEntityType,

	/**
	 * If a field's `required` is set to `true`, it means that the property must have a value for the whole model to be created.
	 * If `required` is `true` and the property has a value of `null` or `undefined`, then the model itself will be null.
	 * @default false
	 */
	required?:boolean,

	/**
	 * A condition that has to be satisfied in order to assign value to the property.
	 *
	 * @example <caption>Assigning ZIP code only if street exists</caption>
	 *
	 * ```typescript
	 * @EntityField({ require: "street" })
	 * zip:string;
	 * ```
	 *
	 * @example <caption>Assigning ZIP code only if both street and country exist</caption>
	 * ```typescript
	 * @EntityField({ require: (data:AddressRawData) => data.street && data.country })
	 * zip:string;
	 * ```
	 */
	require?:((data:any, config?:ParisConfig) => any) | string,

	/**
	 * Parses the raw data before it's used by Paris to create the property's value
	 * Sometimes the value in the raw data is not formatted as we'd like, or more information might be needed to create the desired value. A field's `parse` configuration is available for changing the raw data before it's passed to Paris.
	 * Important: `parse` should return a new RAW data, not a Paris model.
	 *
	 * @example <caption>Parsing a bitwise value into an array</caption>
	 * ```typescript
	 * @EntityField({
	 *		arrayOf: NotificationFormat,
	 *		parse: (formatBitWise: number) => {
	 *			return notificationFormatValues.reduce((formats: Array<number>, notificationFormat) => {
	 *				return notificationFormat.id > 0 && (formatBitWise & notificationFormat.id) ? [...formats, notificationFormat.id] : formats;
	 *			}, []);
	 *		},
	 *	})
	 * formatFlavor: Array<NotificationFormat>;
	 * ```
	 * @param fieldData The field's data from the raw data
	 * @param itemData The whole object's raw data
	 * @param {DataQuery} query The query (if any) that was used for getting the data
	 * @returns {any} new raw data.
	 */
	parse?:(fieldData?:any, itemData?:any, query?: DataQuery) => any,

	/**
	 * A method used to serialize the model field's data back into raw data, to be used when saving the model to backend.
	 * `serialize` may also be set to `false`, in which case the field won't be included in the serialized model.
	 */
	serialize?: false | ((itemData:any, serializationData?:any) => any)
}

export const FIELD_DATA_SELF = "__self";
export type EntityFieldConfigFunctionOrValue = ((data:any, config?:ParisConfig) => string) | string;
