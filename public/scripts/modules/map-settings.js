import Storable from './storable.js';

export default class MapSettings extends Storable {
	//Static properties
	static storageLocation = "mapSettings";

	//Properties
	/**
	 * Title of our location list. This is used for {@link http://buildingwithblocks.info/index_expanded.html#settings_title_heading|Map title} on Pen and Paper.
	 */
	title = "";
	/**
	 * This is used on the map as a sort of description on {@link http://buildingwithblocks.info/|Pen & Paper}.
	 * It can be HTML if you would like
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_blurb_heading|blurb}
	 */
	blurb = "Use up/down or mousewheel to zoom, drag to scroll";
	/**
	 * Sets the radius of the map. Try to make this multiples of 32 for a good map scale.
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_range_heading|range}
	 */
	range = 3200;
	/**
	 * Specifies if the crosshair at the center of the map is shown or not.
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_showorigin_heading|showorigin}
	 */
	showOrigin = true;
	/**
	 * Origin or center of map
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_coords_heading|x and y}
	 */
	origin = {
		x: 0,
		z: 0
	};
	/**
	 * Show the distance scale at the bottom left of the map
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_showscale_heading|showscale}
	 */
	showScale = true;
	/**
	 * Show the minecraft coordinates of a location when you hover over it with a mouse
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_showcoords_heading|showcoordinates}
	 */
	showCoordinates = false;
	/**
	 * Specifies the zoom level that must be reached before labels are displayed (0 is always)
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_hidelabels_heading|hidelabelsabove}
	 */
	hideLabelsAbove = 0;
	/**
	 * Custom icon file to use for any custom icons (remember that any icon-indexes will begin at 64)
	 * @see {@link http://buildingwithblocks.info/index_expanded.html#settings_icons_heading|icons}
	 */
	customIconFile = null;

	// Methods
	/**
	 * Save this object to local storage using the @see storageLocation
	 * If storage location is empty then don't save it
	 */
	saveToStorage(){
		MapSettings.saveToStorage(this);
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
		let newObject = new MapSettings();

		//Check if passed in object was good and assign any properties that do exists
		if (obj && Object.keys(obj).length > 0) {
			newObject = Object.assign(newObject, obj);
			console.log("Valid object passed in.");
		}

		//Return the object
		return newObject;
	}
}