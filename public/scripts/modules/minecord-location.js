import BaseClass from './base-class.js';

export default class MinecordLocation extends BaseClass {
	//Properties
	/**
	 * Type of location (this defaults some stuff like icon and link)
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#locationTypes_heading|Types}
	 */
	type = "";
	/**
	 * X coordinate of the location 
	 * @type {number} 
	*/
	x = null;
	/** 
	 * Y coordinate of the location
	 * @type {number} 
	*/
	y = null;
	/** 
	 * Z coordinate of the location
	 * @type {number} 
	*/
	z = null;
	/**
	 * Description of what is at this location
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#locationCaption_heading|description}
	 */
	description = "";
	/**
	 * Owner of the location (empty for no owner)
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#locationCaption_heading|owner}
	 */
	owner = "";
	/**
	 * Url for this location (such as an image of it)
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#locationHref_heading|href}
	 */
	url = "";
	/** 
	 * Index to use for the icon for this location
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#locationIconIndex_heading|icon-index}
	 * @type {number} */
	iconIndex = null;
	/** 
	 * Last time updated (in milliseconds)
	 * @type {number}
	 * */
	lastUpdated = 0;

	/**
	 * Constructor for a Location for the app
	 * @param {String} type Type of location (this defaults some stuff like icon and link)
	 * @param {Number} x X coordinate of location
	 * @param {Number} y Y coordinate of location
	 * @param {Number} z Z coordinate of location
	 * @param {String} description Description of what is at this location
	 * @param {String} owner Owner of this location
	 * @param {String} url Url for this location (such as image of it)
	 * @param {Number} iconIndex Icon index of icon to use for the location when displaying it on the map
	 */
	constructor(type = "", x = null, y = null, z = null, description = "", owner = "", url = "", iconIndex = null) {
		super();
		this.type = type;
		this.x = x;
		this.y = y;
		this.z = z;
		this.description = description;
		this.owner = owner;
		this.url = url;
		this.iconIndex = iconIndex;
		this.lastUpdated = Date.now();
	}

	/**
	 * Get the key for the values in this location
	 * @returns Key in format "x|y|z"
	 */
	getKey(){
		return this.x + "|" + this.y + "|" + this.z;
	}

	// Static Methods
	/**
	 * This is used to create an object from a generic object that we don't know what version it was from.
	 * Any values that don't exist will be defaults.
	 * If any properties change names this will handle creating the new object and doing the conversion.
	 * @param {Object} obj object from who knows what version 
	 * @returns new object with copied properties
	 */
	static create(obj){
		let newObject = new MinecordLocation();

		//Check if passed in object was good and assign any properties that do exists
		if (this.hasMinimum(obj)) {
			newObject = Object.assign(newObject, obj);
			console.log("Valid object passed in.");
		}

		//Return the object
		return newObject;
	}

	/**
	 * Check if object has bare minimum required properties to 
	 * @param {Any} obj Object to check (non-object will fail)
	 */
	static hasMinimum(obj) {
		return (obj && typeof obj === 'object' && obj.x && obj.y && obj.z);
	}
}