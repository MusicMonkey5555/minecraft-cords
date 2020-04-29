export default class BaseClass {
	/**
	 * Constructor
	 */
	constructor(){}

	//Methods

	// Static Methods
	/**
	 * This is used to create an object from a generic object that we don't know what version it was from.
	 * Any values that don't exist will be defaults.
	 * If any properties change names this will handle creating the new object and doing the conversion.
	 * @param {Object} obj object from who knows what version 
	 * @returns new object with copied properties
	 */
	static create(obj){
		let newObject = new this();
		//Check if passed in object was good and assign any properties that do exists
		if (obj && Object.keys(obj).length > 0) {
			newObject = Object.assign(newObject, obj);
		}

		//Return the object
		return newObject;
	}
}