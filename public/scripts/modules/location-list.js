import Storable from "./storable.js";
import MinecordLocation from "./minecord-location.js";

/**
 * List of loctions with the location key mapping to the property name
 * @type Object.<string, MinecordLocation>
 */
export default class LocationList extends Storable {
	//Static properties
	static storageLocation = "locationList";

	/**
	 * Add a new location to the object, making sure it is of the correct type and that the key doesn't exists yet
	 * @param {MinecordLocation} location New location to be added
	 * @returns true if item was added, false if not (already exists or wrong type)
	 */
	addItem(location){
		//Check if the type is correct and if we already have this key
		if(location instanceof MinecordLocation){
			const key = location.getKey();
			if(!(key in this)){
				this[key] = location;
				return true;
			}
		}

		return false;
	}

	/**
	 * Add a new location to the object, making sure it is of the correct type
	 * @param {MinecordLocation} location New location to be inserted
	 * @returns true if item was added, false if not (wrong type)
	 */
	insertItem(location){
		//Check if the type is correct
		if (location instanceof MinecordLocation) {
			const key = location.getKey();
			this[key] = location;
			return true;
		}

		return false;
	}

	/**
	 * Remove an item from the list
	 * @param {String|MinecordLocation} location Location object to remove or key of location object to remove
	 * @returns True if item was removed, false if not
	 */
	removeItem(location){
		let key = "";
		if(location instanceof MinecordLocation){
			key = location.getKey();
		}
		else if(typeof location === 'string'){
			key = location;
		}

		if(key.length > 0 && this.hasOwnProperty(key)){
			delete this[key];
			return true;
		}

		return false;
	}

	/**
	 * Check if the given key exists yet
	 * @param {String} key To check for
	 */
	hasKey(key){
		return (key && typeof key === 'string' && key.length > 0 && this.hasOwnProperty(key));
	}

	/**
	 * Check if the given location key exists already
	 * @param {MinecordLocation} location Check if this location key is found
	 */
	hasObject(location){
		return (location && location instanceof MinecordLocation && this.hasOwnProperty(location.getKey()));
	}

	/**
	 * Get the item at the given key (checks key type and that it is a property of this object)
	 * @param {String} key Key to get item at
	 * @returns {MinecordLocation} Object at that location, null if none found or key is incorrect
	 */
	get(key){
		return (key && typeof key === 'string' && key.length > 0 && this.hasOwnProperty(key) ? this[key] : null);
	}

	// Methods
	/**
	 * Save this object to local storage making sure object is holding correct data (Will save empty object)
	 * @returns true if something was stored false if not 
	 */
	saveToStorage(){
		const values = Object.values(this);
		if(values.length === 0 || (values.length > 0 && values[0] instanceof MinecordLocation)){
			return super.saveToStorage();
		}
		return false;
	}

	// Static methods
	/**
	 * Create a object dictionary of coordinates to Minecordlocation objects. It will loosely fit the object and also handle arrays as long as most of the data is there.
	 * @param {Object.<string, MinecordLocation>|Map.<string, MinecordLocation>|MinecordLocation[]} obj Object to loosely create a location list based on.
	 * @returns New object of this type fitting an object to it (empty/default object if parameter is invalid)
	 */
	static create(obj){
		//Create our returned object
		const newObject = new LocationList();
		if (obj) {
			//If map or array just loop through each element
			if (obj instanceof Map || Array.isArray(obj)) {
				obj.forEach((value, key) => {
					//Make sure we have the bare minimum
					if (MinecordLocation.hasMinimum(value)) {
						//Create the new location for this item
						const newLocation = MinecordLocation.create(value);
						//Get generated key
						const newKey = newLocation.getKey();

						//Check if keys didn't equal
						if (typeof key === 'string' && key.length > 0 && key !== newKey) {
							console.log("Key: " + key + " doesn't match generated key: " + newKey + " so updating");
						}

						//Try to add item
						const wasAdded = newObject.addItem(newLocation);
						if (!wasAdded) {
							console.log("Key " + newKey + " existed so skipping item");
						}
					}
				});
			}
			else if (typeof obj === 'object') {
				if (MinecordLocation.hasMinimum(obj)) {
					const newLocation = MinecordLocation.create(obj);
					newObject.addItem(newLocation);
				}
				else {
					for (const key in obj) {
						if (obj.hasOwnProperty(key)) {
							const value = obj[key];
							if (typeof value === 'object') {
								//Create the new location for this item
								const newLocation = MinecordLocation.create(value);
								//Get generated key
								const newKey = newLocation.getKey();

								if (key != newKey) {
									console.log("Key: " + key + " doesn't match generated key: " + newKey + " so updating");
								}

								//Try to add item
								const wasAdded = newObject.addItem(newLocation);
								if (!wasAdded) {
									console.log("Key " + newKey + " existed so skipping item");
								}
							}
						}
					}
				}
			}
		}

		return newObject;
	}

	/**
	 * Load a location list from local storage
	 * @returns {LocationList>} Object from storage data
	 */
	static loadFromStorage(){
		return super.loadFromStorage();
	}
}