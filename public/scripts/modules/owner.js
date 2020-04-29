import BaseClass from './base-class.js';
import OwnerList from './owner-list.js';

export default class Owner extends BaseClass {
	count = 1;
	name = "";

	constructor(name = "", count = 1){
		super();
		this.name = name ? name.toString() : "";
		this.count = count;
	}

	static create(obj){
		let newObject = new Owner();

		//Handle different value types
		if (typeof obj === 'object') {
			if (obj.hasOwnProperty('count')) {
				if (typeof obj.count === 'string') {
					let value = parseInt(obj.count, 10);
					if (value !== NaN) {
						newObject.count = value;
					}
				} else if (typeof obj.count === 'number') {
					newObject.count = obj.count;
				}
			}

			if (obj.hasOwnProperty('name')) {
				if (typeof obj.name === 'string' && obj.name.length > 0) {
					newObject.name = obj.name;
				}
			}
		}
		else if (typeof obj === 'number') {
			newObject.count = obj;
		}
		else if (typeof obj === 'string') {
			//Check if only digits (numbers)
			if(/^((\d+)|(\d*\.\d*))$/.test(obj)){
				let value = parseInt(obj, 10);
				newObject.count = value;
			}
			else
			{
				newObject.name = value;
			}
		}

		return newObject
	}
}