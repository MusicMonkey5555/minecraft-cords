import Storable from "./storable.js";
import Owner from './owner.js';
import LocationList from "./location-list.js";

/**
 * List of owners and number of occurances of them
 */
export default class OwnerList extends Storable {
	//Static properties
	static storageLocation = 'ownerList';

	/**
	 * Add a new owner to the dictionary
	 * @param {String|Owner} owner Owner to add (either up the count or add as new)
	 * @returns true if owner was added/count was incremented, false if not
	 */
	addOwner(owner) {
		if (owner && typeof owner === 'string' && owner.length > 0) {
			//Set the default for this
			let item = new Owner(owner, 0);

			//Add it if we don't have it and get the object if we do
			if (!this.hasOwnProperty(owner)) {
				this[owner] = item;
			} else {
				item = this[owner];
			}

			//Add one more to the count
			item.count++;
			return true;
		}
		else if(owner && owner instanceof Owner){
			if(this.hasOwnProperty(owner.name)){
				this[owner.name].count += owner.count > 0 ? owner.count : 1;
			}
			else {
				this[owner.name] = owner;
			}
			return true;
		}
		return false;
	}

	/**
	 * Remove an owner from the dictionary or decrement the count of them
	 * @param {String|Owner} owner Owner to remove (either decrement the count or remove)
	 * @returns True if list was updated, false if not
	 */
	removeOwner(owner){
		let updated = false;

		//If the owner is in the list then decrement the count
		if(owner && typeof owner === 'string' && owner.length > 0 && this.hasOwnProperty(owner)){
			const item = this[owner];
			item.count--;
			updated = true;

			//If count is below or equal to zero then remove it
			if(item.count <= 0){
				delete this[owner];
			}
		}
		else if(owner && owner instanceof Owner){
			if(this.hasOwnProperty(owner.name)){
				this[owner.name].count -= owner.count > 0 ? owner.count : 1;
				updated = true;

				//If count is below or equal to zero then remove it
				if(item.count <= 0){
					delete this[owner.name];
				}
			}
		}

		return updated;
	}

	/**
	 * Get array of all the key value pairs (unsorted)
	 * @returns {[string, Owner][]}
	 */
	entries(){
		return Object.entries(this);
	}

	/**
	 * Sorted array of key value pairs
	 */
	getSortedEntries(){
		return this.entries().sort(([akey, avalue],[bkey,bvalue]) => {return avalue.count - bvalue.count});
	}

	/**
	 * Get the object of the given owner name
	 * @param {String} ownerName Owner name to get object for
	 * @returns {Owner} Object at the owner name or null if not found
	 */
	get(ownerName){
		return (ownerName && typeof ownerName === 'string' && ownerName.length > 0 && this.hasOwnProperty(ownerName) ? this[ownerName] : null);
	}

	/**
	 * Has owner name already
	 * @param {String} ownerName Owner name to check
	 * @returns true if found, false if not
	 */
	has(ownerName){
		return (ownerName && typeof ownerName === 'string' && ownerName.length > 0 && this.hasOwnProperty(ownerName) ? true : false);
	}

	/**
	 * Get the count of the given owner name
	 * @param {String} ownerName Owner name to get count of
	 * @returns {number} number of occurances of this owner (0 if not found)
	 */
	getCount(ownerName){
		return (ownerName && typeof ownerName === 'string' && ownerName.length > 0 && this.hasOwnProperty(ownerName) ? this[ownerName].count : 0);
	}

	/**
	 * Save a map of all the owners to local storage
	 */
	saveToStorage(){
		const values = Object.values(this);
		if(values.length === 0 || (values.length > 0 && typeof values[0] === 'object' && values[0].hasOwnProperty('count'))){
			return super.saveToStorage();
		}
		return false;
	}

	/**
	 * Create a dictionary of owners
	 * @param {Object.<string,{count: 0}>|Map.<string, {count: number}>|Map.<string, number>|{name: string, count: number}|{name: string, count: number}[]} obj Object to copy values from
	 * @returns New owner list
	 */
	static create(obj){
		let newObject = new OwnerList();

		//Check out the object
		if(obj){
			if(obj instanceof Map){
				obj.forEach((value, key) => {
					if(typeof key === 'string' && key.length > 0){
						const newOwner = Owner.create(value);
						if(newOwner.name === "" || newOwner.name !== key)
						{
							newOwner.name = key;
						}
						newObject.addOwner(newOwner);
					}
				});
			}
			else if(Array.isArray(obj)){
				//Loop through each item
				for (var item in obj) {
					if (item) {
						if (typeof item === 'object') {
							if (obj.hasOwnProperty("name")) {
								const newOwner = Owner.create(obj);
								if(newOwner.name.length > 0 && newOwner.count > 0){
									newObject.addOwner(newOwner);
								}
							}
						}
						else if(typeof item === 'string' && item.length > 0){
							newObject.addOwner(item);
						}
					}
				}
			}
			else if(typeof obj === 'object'){
				if(obj.hasOwnProperty("name")){
					const newOwner = Owner.create(obj);
					if(newOwner.name.length > 0 && newOwner.count > 0){
						newObject.addOwner(newOwner);
					}
				}
				else{
					for (const key in obj) {
						if (key && typeof key === 'string' && key.length > 0 && obj.hasOwnProperty(key)) {
							const value = obj[key];
							const newOwner = Owner.create(value);
							if (newOwner.name === "" || newOwner.name !== key) {
								newOwner.name = key;
							}
							newObject.addOwner(newOwner);
						}
					}
				}
			}
		}

		return newObject;
	}

	/**
	 * Load a location list from local storage
	 * @returns {OwnerList} Dictionary object with key of owner name and value of owner data from storage data
	 */
	static loadFromStorage(){
		return super.loadFromStorage();
	}
}