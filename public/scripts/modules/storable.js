import BaseClass from './base-class.js';

/**
 * An object that is stored in local storage
 */
export default class Storable extends BaseClass {
	/**
	 * Local storage location for this class to load from
	 */
	static storageLocation = "";

	/**
	 * Save this object to local storage using the @see storageLocation
	 * If storage location is empty then don't save it
	 * @returns True if data was stored false if not
	 */
	saveToStorage(){
		if(this.constructor.storageLocation.length > 0){
			const data = JSON.stringify(this);
			localStorage.setItem(this.constructor.storageLocation, data);
			return true;
		}

		return false;
	}

	// Static Methods
	/**
	 * Load an object of this type from local storage using the @see storageLocation
	 */
	static loadFromStorage(){
		let obj = this.storageLocation.length > 0 ? localStorage.getItem(this.storageLocation) : null;
		if (obj) {
		  try {
			obj = JSON.parse(obj);
		  } catch (ex) {
			obj = {};
		  }
		}

		//Assign a default value and handle updates to class
		obj = this.create(obj);

		return obj;
	}
}