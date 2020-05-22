/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

import LocationList from './modules/location-list.js';
import MapSettings from './modules/map-settings.js';
import OwnerList from './modules/owner-list.js';
import MinecordLocation from './modules/minecord-location.js';
import Color from './modules/color.js';

/**
 * A location type
 * @typedef {{description: String, iconIndex: Number}} LocationType
 */

/**
 * Location types
 * @typedef {Object.<string, {description: String, iconIndex: Number}} LocationTypes
 */

/**
 * Holds all the data about our app
 */
const minecordApp = {
	/**
	 * Location of file we are saving to (currently from dropbox only)
	 */
	filename: "",
	/**
	 * If we are linked to a native file (json) where we can save all the data this app supports
	 * or if it's linked to a {@link http://buildingwithblocks.info/|Pen & Paper} location formatted file
	 */
	native: true,
	/**
	 * All the settings for our map
	 * @type {MapSettings}
	 */
	mapSettings: {
		
	},
	/**
	 * All locations we added
	 * Key is in format "x|y|z"
	 * @type {LocationList}
	 */
	selectedLocations: {},
	
	/** Dialogue used for editing and adding locations */
	addDialogContainer: document.getElementById('addDialogContainer'),

	/** Dialogue used for editing map settings */
	setttingsDialogContainer: document.getElementById('setttingsDialogContainer'),

	/** Spinner for the page */
	pageSpinner: document.getElementById('pageSpinner'),
	/**
	 * All possible location types
	 * @type {LocationTypes}
	 */
	locationTypes: {},
	/**
	 * All possible icon classes
	 * @type {String[]}
	 */
	iconClasses: [],
	/**
	 * All currently entered usersnames (loaded from local storage)
	 * @type {OwnerList}
	 */
	owners: {}
};

/**
 * Check if the add/edit dialogue is visble or not
 */
function isDialogueVisible(){
	return minecordApp.addDialogContainer.classList.contains('visible') || minecordApp.setttingsDialogContainer.classList.contains('visible');
}

/**
 * Prompt for a new location to add
 */
function promptAddLocation(){
	const isVisible = isDialogueVisible();

	if(!isVisible){
		minecordApp.addDialogContainer.querySelector('.dialog-title').textContent = "Add New Coordinate";

		//Change the button title
		document.getElementById('butDialogAdd').textContent = "Add";

		//Change callback
		document.getElementById('butDialogAdd').addEventListener('click', addLocation);

		//Reset some values
		document.getElementById('editLocationKey').textContent = "";
		const xCord = document.getElementById('xCord');
		const yCord = document.getElementById('yCord');
		const zCord = document.getElementById('zCord');
		xCord.value = "";
		yCord.value = "";
		zCord.value = "";

		//Make sure our select menu icon id displayed based on whatever the current value is
		document.getElementById('selectIconIndex').dispatchEvent(new Event('change'));

		//Show the dialogue
		minecordApp.addDialogContainer.classList.add('visible');
	}
}

/**
 * Set the add location prompt to some values passed in (only works if not visible)
 * @param {MinecordLocation} location Location to update dialogue with
 * @returns True if we set the prompt values, false if not
 */
function setLocationPrompt(location){
	const isVisible = isDialogueVisible();
	if(!isVisible){
		//Fill out the values in the menu
		// Get the selected type
		const selectType = document.getElementById('selectLocationType');
		selectType.value = location.type;
	  
		//Get all the input fields
		const xCord = document.getElementById('xCord');
		const yCord = document.getElementById('yCord');
		const zCord = document.getElementById('zCord');
		const description = document.getElementById('description-input');
		const owner = document.getElementById('owner-input');
		const url = document.getElementById('url-input');

		xCord.value = location.x;
		yCord.value = location.y;
		zCord.value = location.z;
		description.value = location.description;
		owner.value = location.owner;
		url.value = location.url;
		url.dataset["dropbox"] = location.urlMeta ? JSON.stringify(location.urlMeta) : null;
	  
		//Get the icon dropdown
		const selectIcon = document.getElementById('selectIconIndex');
		selectIcon.value = location.iconIndex || "";
		selectIcon.dispatchEvent(new Event('change'));

		return true;
	}

	return false;
}

/**
 * Prompt to edit a location after clicking on a card
 * @param {Event} evt Click event for item card
 */
function promptEditLocation(evt) {
	const parent = evt.srcElement.parentElement;
	const location = minecordApp.selectedLocations.get(parent.id);

	//Make sure this is a location
	if (location) {
		//Try to update the prompt with the location
		const updated = setLocationPrompt(location);

		//If we were able to set it's values then we can do the rest
		if (updated) {

			document.getElementById('editLocationKey').textContent = location.getKey();

			//Change the dialogue title
			minecordApp.addDialogContainer.querySelector('.dialog-title').textContent = "Edit Coordinate";

			//Change the button title
			document.getElementById('butDialogAdd').textContent = "Edit";

			//Change callback
			document.getElementById('butDialogAdd').addEventListener('click', function () {
				const xCord = document.getElementById('xCord');
				const yCord = document.getElementById('yCord');
				const zCord = document.getElementById('zCord');
				const existingKey = document.getElementById('editLocationKey').textContent;

				const loc = new MinecordLocation("", xCord.value, yCord.value, zCord.value);
				const key = loc.getKey();

				//Remove the location we seem to be editing
				removeLocationByKey(key);

				//Add the new location
				addLocation();

				//Clear out what we were editing
				document.getElementById('editLocationKey').textContent = "";
			});

			//Show the dialogue
			minecordApp.addDialogContainer.classList.add('visible');
		}
	}
}

function checkCoordinates(event){
	const xCord = document.getElementById('xCord');
	const yCord = document.getElementById('yCord');
	const zCord = document.getElementById('zCord');
	const cordError = document.getElementById('cordError');
	const existingKey = document.getElementById('editLocationKey').textContent;

	const loc = new MinecordLocation("", xCord.value, yCord.value, zCord.value);
	const key = loc.getKey();
	const hasKey = minecordApp.selectedLocations.hasKey(key);
	var validityMsg = "";
	//Set validity message based on if there is a coordinate collision
	if(hasKey){
		if(existingKey === ""){
			validityMsg = "Coordinates match existing record, will over-write existing record.";
		}
		else if(existingKey !== key){
			validityMsg = "Coordinates have changed to another record, will over-write that one instead.";
		}
	}

	//Check if we have a message and set the controls
	cordError.textContent = validityMsg;
	xCord.setCustomValidity(validityMsg);
	yCord.setCustomValidity(validityMsg);
	zCord.setCustomValidity(validityMsg);
	if(validityMsg === ""){
		cordError.classList.remove('visible');
	} else {
		cordError.classList.add('visible');
	}
}

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation() {
	// Hide the dialog
	minecordApp.addDialogContainer.classList.remove('visible');

	// Get the selected type
	const selectType = document.getElementById('selectLocationType');
	const selectedType = selectType.options[selectType.selectedIndex];
	const type = selectedType.value;
	//const label = selectedType.textContent;

	//Get all the input fields
	const xCord = document.getElementById('xCord');
	const yCord = document.getElementById('yCord');
	const zCord = document.getElementById('zCord');
	const description = document.getElementById('description-input');
	const owner = document.getElementById('owner-input');
	const url = document.getElementById('url-input');
	const urlMeta = url.dataset["dropbox"] ? JSON.parse(url.dataset["dropbox"]) : null;

	//Get the icon dropdown
	const selectIcon = document.getElementById('selectIconIndex');
	const selectedIcon = selectIcon.options[selectIcon.selectedIndex];
	const iconIndex = selectedIcon.value;

	//Set all the data about a location
	const location = new MinecordLocation(type, xCord.value, yCord.value, zCord.value, description.value, owner.value, url.value, iconIndex, urlMeta);

	// Create a new card & get the weather data from the server
	const card = getItemCard(location);

	renderLocation(card, { time: Date.now(), timezone: 'utc' })

	/*
	getLocationFromNetwork(type).then((forecast) => {
	  renderForecast(card, forecast);
	});
	*/

	// Save the updated list of locations.
	const key = location.getKey();
	const exists = minecordApp.selectedLocations.hasKey(key);
	if(exists){
		console.log("Location: " + key + " exists so updating it.");
	}
	minecordApp.selectedLocations.insertItem(location);
	minecordApp.selectedLocations.saveToStorage();

	//Update list of owners and save it and update the menu for next time
	if(!exists){
		const ownersUpdated = minecordApp.owners.addOwner(location.owner);
		if(ownersUpdated){
			minecordApp.owners.saveToStorage();
			onUpdatedOwnerList();
		}
	}
}

/**
 * Event handler for .remove-item, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
	//Get the card
	const parent = evt.srcElement.parentElement;

	//Remove the actul card and location from our data
	removeLocationByKey(parent.id);
}

/**
 * Remove a location and card by it's key
 * @param {String} key Element key/location key
 */
function removeLocationByKey(key) {
	//Get the card
	const parent = document.getElementById(key);
	if(parent){
		parent.remove();
	}

	//If the item was in our location list update the data behind
	if (minecordApp.selectedLocations.hasKey(key)) {

		//Update the owner list, save it, and update the menu
		const location = minecordApp.selectedLocations.get(key);
		const ownersUpdated = minecordApp.owners.removeOwner(location.owner);
		if (ownersUpdated) {
			minecordApp.owners.saveToStorage();
			onUpdatedOwnerList();
		}

		//Remove the location
		minecordApp.selectedLocations.removeItem(key);
		minecordApp.selectedLocations.saveToStorage();
	}
}

/**
 * Renders the location data into the card element.
 *
 * @param {Element} card The card element to update.
 * @param {Object} data Locaion data to update the element with.
 */
function renderLocation(card, data) {
	if (!data) {
		// There's no data, skip the update.
		return;
	}
	// Find out when the element was last updated.
	const cardLastUpdatedElem = card.querySelector('.card-last-updated');
	const cardLastUpdated = cardLastUpdatedElem.textContent;
	const lastUpdated = parseInt(cardLastUpdated);

	// If the data on the element is newer, skip the update.
	if (lastUpdated >= data.time) {
		return;
	}
	cardLastUpdatedElem.textContent = data.time;

	//Update location type icon
	const locTypeLabel = card.querySelector('.info .loc-type-label');
	const locTypeIconClass = getLocationTypeIconClass(locTypeLabel.textContent);
	const locTypeDiv = card.querySelector('.info .loc-type');
	locTypeDiv.className = `loc-type ${locTypeIconClass}`;
	updateIconWrapper(locTypeDiv);

	//Update icon index icon
	const iconIndex = card.querySelector('.info .icon-index-label').textContent;
	const iconIndexClass = minecordApp.iconClasses[iconIndex] || "empty";
	const iconIndexNameDiv = card.querySelector('.info .icon-index-name');
	if(iconIndexClass === "empty"){
		iconIndexNameDiv.parentElement.classList.add('hide');
	} else {
		iconIndexNameDiv.parentElement.classList.remove('hide');
	}

	iconIndexNameDiv.textContent = iconIndexClass;
	const iconDiv = card.querySelector('.info .icon-index');
	iconDiv.className = `icon-index ${iconIndexClass}`;
	updateIconWrapper(iconDiv);

	//Url stuff
	const urlCtrl = card.querySelector('.url');
	const urlMeta = urlCtrl.dataset["meta"] ? JSON.parse(urlCtrl.dataset["meta"]) : null;
	const mobile = isMobile();
	if(urlMeta){
		const url = urlMeta.link;
		const urlParts = parseUrl(url);
		const fileName = urlMeta.name ? urlMeta.name : urlParts.filename + "." + urlParts.ext;
		
		//How do display it
		const useIframe = false;
		const usePreview = true;

		//If it's an image then display the image
		if(urlParts.isImage === true && ["dropbox","dropboxusercontent"].includes(urlParts.domain) && urlParts.tld === "com"){
			if(useIframe && Dropbox.isBrowserSupported()){
				urlCtrl.innerHTML = `<a href="${url}" class="dropbox-embed" data-height="300px" data-width="500px"></a>`;
			}
			else {
				//Make the dropbox link a download so it can be in a img tag
				const addr = new URL(usePreview && urlMeta.thumbnailLink ? urlMeta.thumbnailLink : url);
				if(addr.searchParams.has('dl')){
					addr.searchParams.set('dl',1);
				}
				if(addr.searchParams.has('bounding_box')){
					//Get all our possible preview image sizes
					const boundingboxOptions = [75,256,800,1280,2048];

					//Get the width of the card minus our padding
					const width = card.offsetWidth - 10;

					//Find the closes box size (bounding options) to our width
					const bounding_box = boundingboxOptions.reduce((a,b) => { return Math.abs(b - width) < Math.abs(a - width) ? b : a;});
					addr.searchParams.set('bounding_box', bounding_box);
				}

				//Get the items that make up the image
				const imageSrc = addr.toString();

				//Create the html to diplay it
				urlCtrl.innerHTML = `<figure>
					<img src="${imageSrc}" alt="${fileName}">
					<figcaption><a href="${url}" target="_blank">${fileName}</a></figcaption>
				</figure>`;
			}
		}
	}

	// If the loading spinner is still visible, remove it.
	const spinner = card.querySelector('.card-spinner');
	if (spinner) {
		card.removeChild(spinner);
	}
}

function updateIconWrapper(iconElement){
	if(iconElement instanceof HTMLElement && 
		iconElement.parentElement && 
		iconElement.parentElement.parentElement && 
		iconElement.parentElement.parentElement.classList.contains('icon-outer-wrapper'))
	{
		const wrapperDiv = iconElement.parentElement.parentElement;
		if(iconElement.classList.contains('empty')){
			wrapperDiv.style.display = "none";
		}
		else
		{
			//Make sure we display as default
			wrapperDiv.style.display = null;

			//Set the background color to the same color (if clear, then clear out background color style)
			const iconStyle = window.getComputedStyle(iconElement);
			const color = Color.fromString(iconStyle.backgroundColor);
			if(color.a == null || color.a <= 0.0){
				wrapperDiv.style.backgroundColor = null;
			}
			else
			{
				wrapperDiv.style.backgroundColor = iconStyle.backgroundColor;
			}
		}
	}
}

/**
 * Get's the HTML element for the x-y-z data, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {MinecordLocation} location Location object
 * @return {Element} The element for the location card.
 */
function getItemCard(location) {
	const id = location.getKey();
	const card = document.getElementById(id);
	if (card) {
		return card;
	}
	const newCard = document.getElementById('item-template').cloneNode(true);
	newCard.querySelector('.location').textContent = location.x + "," + location.y + "," + location.z;
	newCard.setAttribute('id', id);

	//Set the time this item was last updated
	const updatedLast = luxon.DateTime
		.fromMillis(location.lastUpdated)
		//.setZone(data.timezone)
		.toFormat('DDDD t');
	newCard.querySelector('.date').textContent = updatedLast;

	//fill out the other data
	newCard.querySelector('.description').textContent = location.description;
	newCard.querySelector('.owner').textContent = location.owner;

	//Set the location type text
	newCard.querySelector('.info .loc-type-label').textContent = location.type;

	const urlCtrl = newCard.querySelector('.url');
	if(typeof location.url !== 'undefined' && location.url != null && location.url.length > 0){
		const urlParts = parseUrl(location.url);
		const meta = location.urlMeta;
		const displayName = meta && meta.name && meta.name.length > 0 ? meta.name : urlParts.displayName + (urlParts.ext && urlParts.ext.length > 0 ? "." + urlParts.ext : "")

		//Set default handling
		urlCtrl.innerHTML = `<a href="${location.url}" target="_blank">${displayName}</a>`;

		//Add the data if we have it
		if(meta){
			urlCtrl.dataset["meta"] = JSON.stringify(meta);
		}
	}

	newCard.querySelector('.info .icon-index-label').textContent = location.iconIndex;

	//Register click events
	newCard.querySelector('.remove-item').addEventListener('click', removeLocation);
	newCard.querySelector('.edit-item').addEventListener('click', promptEditLocation);
	
	//Add the card and display it
	document.querySelector('main').appendChild(newCard);
	newCard.removeAttribute('hidden');

	return newCard;
}

/**
 * Parse a url string into it's parts
 * @param {string} url Url string to parse into parts
 */
function parseUrl(url){
	const ulrParts = {
		displayName: null,
		filename: null,
		ext: null,
		protocol: null,
		subdomain: null,
		domain: null,
		/**
		 * Top Level domain
		 */
		tld: null,
		port: null,
		/**
		 * If it's an image or a link to another map or null not sure
		 * @type {?boolean}
		 */
		isImage: null
	};

	//Make sure param is valid
	if(typeof url === 'string' && url != null && url.length > 0){
		ulrParts.displayName = url.substr(-10);
		
		//Parse using regex
		const regexArray = /(?<protocol>\w*)\:\/\/(?:(?:(?<thld>[\w\-]*)(?:\.))?(?<sld>[\w\-]*))\.(?<tld>\w*)(?:\:(?<port>\d*))?.*\/(?<filename>[\w-]+)\.(?<ext>bmp|cr2|gif|ico|ithmb|jpeg|jpg|nef|png|raw|svg|tif|tiff|wbmp|webp|txt|json|csv)/g.exec(url);
		if(regexArray !== null && regexArray.length > 0 && regexArray.groups){
			ulrParts.displayName = regexArray.groups["filename"] || displayedName;
			ulrParts.filename = regexArray.groups["filename"];
			ulrParts.ext = regexArray.groups["ext"] || "";
			ulrParts.protocol = regexArray.groups["protocol"];
			ulrParts.subdomain = regexArray.groups["thld"];
			ulrParts.domain = regexArray.groups["sld"];
			ulrParts.tld = regexArray.groups["tld"];
			ulrParts.port = regexArray.groups["port"];
		}
	}

	//Extra checks
	if(ulrParts.ext){
		ulrParts.isImage = ["txt","json","csv"].includes(ulrParts.ext) ? false : true;
	}

	return ulrParts;
}

/**
 * Check if we are using a mobile browser or not
 */
function isMobile(){
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}

/**
 * Get's the latest locations from the network.
 *
 * @param {string} fileName filename to get locations from.
 * @return {Object} The location data, if the request fails, return null.
 */
function getLocationsFromNetwork(fileName) {
  return fetch(`/locations/${fileName}`)
      .then((response) => {
        return response.json();
      })
      .catch(() => {
        return null;
      });
}

/**
 * Get's the cached locations data from the caches object.
 *
 * @param {String} filename Filename of locations object to get.
 * @return {Object} The locations data, if the request fails, return null.
 */
function getLocationsFromCache(filename) {
	// Add code to get locations data from the caches object.
	if(!('caches' in window)){
		return null;
	}

	const url = `${window.location.origin}/locations/${filename}`;
	return caches.match(url)
	.then((response) => {
		if(response) {
			return response.json();
		}
		return null;
	})
	.catch((err) => {
		console.error('Error getting data from cache', err);
		return null;
	});
}

function startSpinner(){
	const spinning = minecordApp.pageSpinner.classList.contains('visible');
	if(!spinning){
		minecordApp.pageSpinner.classList.toggle('visible');
	}
}

function stopSpinner(){
	const spinning = minecordApp.pageSpinner.classList.contains('visible');
	if(spinning){
		minecordApp.pageSpinner.classList.toggle('visible');
	}
}

function showErrorMessage(){
	console.log("Couldn't get app network files.");
}

function updateLocationTypes(locationTypes){
	//Set our app data with the updated data
	minecordApp.locationTypes = locationTypes;

	//Update add dialogue select menu
	updateLocationTypeDropdown();

	//Update all the cards
	updateData();
}

function updateLocationTypeDropdown(){
	//Update the add dialogue
	const selectType = document.getElementById('selectLocationType');
	
	//Update the select menu options
	selectType.innerHTML = Object.keys(minecordApp.locationTypes)
	.map((key) => {
		const type = minecordApp.locationTypes[key];
		//const iconClass = getLocationTypeIconClass(type);

		return `<option value="${key}" title="${type.description}">${key}</option>`;
	}).join('\n');

	//Call the even when this is selected so everything looks good
	selectType.dispatchEvent(new Event('change'));
}

function updateIconClasses(iconClasses){
	minecordApp.iconClasses = iconClasses;

	//Update add menu dialogue select menu
	updateIconIndexDropdown();

	//Update all the cards
	updateData();
}

function updateIconIndexDropdown(){
	//Update the add dialogue
	const selectIconIndex = document.getElementById('selectIconIndex');
	
	//Update our select menu with our list of options
	selectIconIndex.innerHTML = '<option value=""><div class="icon-index empty"></div> None</option>' + 
	minecordApp.iconClasses
	.map((iconClass, i) => `<option value="${i}"><div class="icon-index ${iconClass}"></div> ${iconClass}</option>`
	).join('\n');

	//Call the even when this is selected so everything looks good
	selectIconIndex.dispatchEvent(new Event('change'));
}

/**
 * Update the owners autocomplete to show the new owner list sorted by number of uses
 */
function onUpdatedOwnerList(){
	//Update the add dialogue
	const ownerList = document.getElementById('owners');
	
	//Update the autocomplete with our list of owners
	ownerList.innerHTML = minecordApp.owners.getSortedEntries()
	.map(([ownerName, owner]) => `<option value="${ownerName}">`).join('\n');
}

/**
 * Render the new map settings in the UI
 */
function onUpdatedMapSettings(){
	const mapSettings = minecordApp.mapSettings;
	const settingsCard = document.getElementById("mapSettings");

	//All text and checkbox settings
	settingsCard.querySelector(".setting-title").textContent = mapSettings.title;
	settingsCard.querySelector(".setting-blurb").innerHTML = mapSettings.blurb;
	settingsCard.querySelector(".setting-range").innerHTML = `<b>Map Range:</b> <a>${mapSettings.range}</a>`;
	settingsCard.querySelector(".setting-show-origin").textContent = mapSettings.showOrigin ? "Show" : "Don't Show";
	settingsCard.querySelector(".setting-origin").textContent = mapSettings.origin.x + ", " + mapSettings.origin.z;
	settingsCard.querySelector(".setting-show-scale").textContent = mapSettings.showScale ? "Show Scale" : "Hide Scale";
	settingsCard.querySelector(".setting-show-coordinates").textContent = mapSettings.showCoordinates ? "Show Coordinates" : "Hide Coordinates";
	settingsCard.querySelector(".setting-hide-label-above").innerHTML = `<b>Hide Labels Above:</b> <a>${mapSettings.hideLabelsAbove}</a>`;
	settingsCard.querySelector(".setting-show-label-below").innerHTML = `<b>Show Labels Below:</b> <a>${mapSettings.showLabelsBelow}</a>`;
	const iconFileGroup = settingsCard.querySelector(".setting-custom-icon-file");
	iconFileGroup.querySelector(".image-path").textContent = mapSettings.customIconFile || "";
	const img = iconFileGroup.querySelector("figure > img");
	img.src = mapSettings.customIconFile || "";
	img.alt = mapSettings.customIconFile || "";
	iconFileGroup.querySelector("figure > figcaption").textContent = mapSettings.customIconFile || "";
	
	//Hide the image group if we don't have a custom icon file
	if(!mapSettings.customIconFile){
		iconFileGroup.style.display = "none";
	} else {
		iconFileGroup.style.display = null;
	}

	const oceanSrcGroup = settingsCard.querySelector(".setting-ocean-src");
	oceanSrcGroup.querySelector(".image-path").textContent = mapSettings.oceanSrc || "";
	const oceanImg = oceanSrcGroup.querySelector("figure > img");
	oceanImg.src = mapSettings.oceanSrc || "";
	oceanImg.alt = mapSettings.oceanSrc || "";
	oceanSrcGroup.querySelector("figure > figcaption").textContent = mapSettings.oceanSrc || "";
	
	//Hide the image group if we don't have a ocean source file
	if(!mapSettings.oceanSrc){
		oceanSrcGroup.style.display = "none";
	} else {
		oceanSrcGroup.style.display = null;
	}

	const foundTheme = MapSettings.OceanThemes.find(theme => theme.theme === mapSettings.oceanTheme)
	settingsCard.querySelector(".setting-ocean-theme").textContent = foundTheme ? foundTheme.title : mapSettings.oceanTheme;
}

/**
 * Prompt to edit the settings
 * @param {Event} evt Click event for settings edit
 */
function promptEditSettings(evt) {
	//Don't do anything if we already have a dialog visible
	if(!isDialogueVisible()){
		const mapSettings = minecordApp.mapSettings;

		//----Fill out the values in the menu----
		
		//Set all the input fields
		document.getElementById('settingTitleEdit').value = mapSettings.title;
		document.getElementById('settingBlurbEdit').value = mapSettings.blurb;
		document.getElementById('settingRangeEdit').value = mapSettings.range;
		document.getElementById('originXCord').value = mapSettings.origin.x;
		document.getElementById('originZCord').value = mapSettings.origin.z;
		document.getElementById('settingShowOriginCheck').checked = mapSettings.showOrigin;
		document.getElementById('settingShowScaleCheck').checked = mapSettings.showScale;
		document.getElementById('settingShowCoordinatesCheck').checked = mapSettings.showCoordinates;
		document.getElementById('settingHideLabelAboveEdit').value = mapSettings.hideLabelsAbove;
		document.getElementById('settingShowLabelBelowEdit').value = mapSettings.showLabelsBelow;

		//Handle the url choosers
		const customUrlInput = document.getElementById('settingCustomIconUrlEdit');
		customUrlInput.value = mapSettings.customIconFile;
		customUrlInput.dataset["dropbox"] = mapSettings.customIconMeta ? JSON.stringify(mapSettings.customIconMeta) : null;
		const oceanSrcInput = document.getElementById('settingOceanSrcEdit');
		oceanSrcInput.value = mapSettings.oceanSrc;
		oceanSrcInput.dataset["dropbox"] = mapSettings.oceanSrcMeta ? JSON.stringify(mapSettings.oceanSrcMeta) : null;

		// Populate the ocean theme optoins and get the selected ocean theme
		const selectOceanTheme = document.getElementById('selectOceanTheme');
		selectOceanTheme.innerHTML = MapSettings.OceanThemes
				.map((oceanTheme, i) => `<option value="${oceanTheme.theme}" ${oceanTheme.theme === mapSettings.oceanTheme ? 'selected' : ''}>${oceanTheme.title}</option>`
				).join('\n');

		//Show the dialogue
		minecordApp.setttingsDialogContainer.classList.add('visible');
	}
}

/**
 * Save settings button event
 * @param {Event} evt Click event for settings saving
 */
function onSaveSettings(evt) {
	//Don't do anything if we already have a dialog visible
	if(isDialogueVisible()){
		const mapSettings = minecordApp.mapSettings;

		//----Get the values from the menu items----
		
		//Get all the input fields
		mapSettings.title = document.getElementById('settingTitleEdit').value;
		mapSettings.blurb = document.getElementById('settingBlurbEdit').value;
		mapSettings.range = +document.getElementById('settingRangeEdit').value;
		mapSettings.origin.x = +document.getElementById('originXCord').value;
		mapSettings.origin.z = +document.getElementById('originZCord').value;
		mapSettings.showOrigin = document.getElementById('settingShowOriginCheck').checked;
		mapSettings.showScale = document.getElementById('settingShowScaleCheck').checked;
		mapSettings.showCoordinates = document.getElementById('settingShowCoordinatesCheck').value;
		mapSettings.hideLabelsAbove = +document.getElementById('settingHideLabelAboveEdit').value;
		mapSettings.showLabelsBelow = +document.getElementById('settingShowLabelBelowEdit').value;

		//Handle the url choosers
		const customUrlInput = document.getElementById('settingCustomIconUrlEdit');
		mapSettings.customIconFile = customUrlInput.value;
		mapSettings.customIconMeta = customUrlInput.dataset["dropbox"] ? JSON.parse(customUrlInput.dataset["dropbox"]) : null;
		
		const oceanSrcInput = document.getElementById('settingOceanSrcEdit');
		mapSettings.oceanSrc = oceanSrcInput.value;
		mapSettings.oceanSrcMeta = oceanSrcInput.dataset["dropbox"] ? JSON.parse(oceanSrcInput.dataset["dropbox"]) : null;
	
		//Get the icon dropdown
		const selectTheme = document.getElementById('selectOceanTheme');
		const selectedTheme = selectTheme.options[selectTheme.selectedIndex];
		mapSettings.oceanTheme = selectedTheme.value;

		//Save to local storage
		mapSettings.saveToStorage();

		//Update the card
		onUpdatedMapSettings();

		//Hide the dialogue
		minecordApp.setttingsDialogContainer.classList.remove('visible');
	}
}

function loadLocationTypes(){
	var networkDataReceived = false;

	startSpinner();

	//fetch fresh data
	var networkUpdate = fetch('/data/LocationTypes.json').then(function (response) {
		return response.json();
	}).then(function (locationTypes) {
		networkDataReceived = true;
		updateLocationTypes(locationTypes);
	});

	//fetch cahced data
	caches.match('/data/LocationTypes.json').then(function (response) {
		if (!response) throw Error("No data");
		return response.json();
	}).then(function (locationTypes) {
		//don't overwrite newer network data
		if (!networkDataReceived) {
			updateLocationTypes(locationTypes);
		}
	}).catch(function () {
		//we didn't get cached data, the network is our last hope
		return networkUpdate;
	}).catch(showErrorMessage).then(stopSpinner());
}

function loadIconClasses(){
	var networkDataReceived = false;

	startSpinner();

	//fetch fresh data
	var networkUpdate = fetch('/data/IconClasses.json').then(function(response){
		return response.json();
	}).then(function(iconClasses){
		networkDataReceived = true;
		updateIconClasses(iconClasses);
	});

	if ('caches' in window) {
		//fetch cahced data
		caches.match('/data/IconClasses.json').then(function(response){
			if(!response) throw Error("No data");
			return response.json();
		}).then(function(iconClasses){
			//don't overwrite newer network data
			if(!networkDataReceived){
				updateIconClasses(iconClasses);
			}
		}).catch(function(){
			//we didn't get cached data, the network is our last hope
			return networkUpdate;
		}).catch(showErrorMessage).then(stopSpinner());
	} else {
		return networkUpdate;
	}
}

/**
 * Get the icon class corresponding to the location type.
 * This is used to display an icon for a location type
 * @param {string} locationType Location Type name according to the list here: http://buildingwithblocks.info/index_expanded.html#locationTypes_heading
 * @returns {string} Css class for icon to display that corresponds to the location type or "" if none found
 */
function getLocationTypeIconClass(locationType){
	//Clean up paramter
	locationType = (locationType || "").trim();

	//Setup variable to return
	var iconClass = "empty";

	if(minecordApp.locationTypes.hasOwnProperty(locationType)){
		const type = minecordApp.locationTypes[locationType];
		if(type.hasOwnProperty("iconIndex") && type.iconIndex > -1 && type.iconIndex < minecordApp.iconClasses.length){
			iconClass = minecordApp.iconClasses[type.iconIndex];
		}
	}

	return iconClass;
}

/**
 * Get all the data from cache or the network that we need
 */
function updateData() {

	for(let [key, location] of Object.entries(minecordApp.selectedLocations)){
		const card = getItemCard(location);
		// CODELAB: Add code to call getForecastFromCache

		// Get the forecast data from the network.
		/*
		getLocationFromNetwork(location.geo)
			.then((forecast) => {
			  renderForecast(card, forecast);
			});
			*/
		//Re-render the card (icons and everything)
		renderLocation(card, { time: Date.now(), timezone: 'utc' });
	}
}

/**
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
	// Get the location list
	minecordApp.selectedLocations = LocationList.loadFromStorage();

	//Get the owner list
	minecordApp.owners = OwnerList.loadFromStorage();
	onUpdatedOwnerList();

	//Get the map settings
	minecordApp.mapSettings = MapSettings.loadFromStorage();
	onUpdatedMapSettings();
	const settingsCard = document.getElementById("mapSettings");
	settingsCard.querySelector(".edit-item").addEventListener('click', promptEditSettings);
	document.getElementById('settingsDialogSaveBtn').addEventListener('click', onSaveSettings);
	document.getElementById('settingsDialogCancelBtn').addEventListener('click', (event) => {
		//Close the menu
		minecordApp.setttingsDialogContainer.classList.remove('visible');
	});

	//add all our cards
	updateData();

	//Load all our static lookup data
	loadIconClasses();
	loadLocationTypes();

	// Set up the event handlers for all of the buttons.
	document.getElementById('butRefresh').addEventListener('click', updateData);
	document.getElementById('butAdd').addEventListener('click', promptAddLocation);
	document.getElementById('butDialogCancel').addEventListener('click', (event) => {
		//Clear out what we were editing
		document.getElementById('editLocationKey').textContent = "";
		document.getElementById('editLocationKey').classList.remove('visible');

		//Close the menu
		minecordApp.addDialogContainer.classList.remove('visible');
	});

	document.getElementById('url-from-dropbox').addEventListener('click', (event) => {
		if(Dropbox){
			Dropbox.choose({
				success: function(files){
					document.getElementById('url-input').value = files[0].link;
					document.getElementById('url-input').dataset["dropbox"] = JSON.stringify(files[0]);
				},
				cancel: function(){

				},
				// Optional. "preview" (default) is a preview link to the document for sharing,
    			// "direct" is an expiring link to download the contents of the file. For more
    			// information about link types, see Link types below.
				linkType: "preview", //"preview"
				multiselect: false,
				extensions: ['.png','.jpeg','.gif','.txt','.csv','.json'],
				folderselect: false,
			});
		}
	});

	// Set up the event handlers for dialogue
	document.getElementById("selectLocationType").addEventListener("change", (event) => {
		//Update icon when we change type
		const locationType = minecordApp.locationTypes[event.target.value];
		const iconSelect = document.getElementById("selectIconIndex");
		iconSelect.value = locationType.iconIndex;
		iconSelect.dispatchEvent(new Event('change'));
	});
	document.getElementById("selectIconIndex").addEventListener("change", (event) => {
		//Update preview icon
		const iconClass = minecordApp.iconClasses[event.target.value] || "empty";
		const iconDiv = document.getElementById("selectIconIndexIcon");
		iconDiv.className = `icon-index ${iconClass}`;
		updateIconWrapper(iconDiv);
	});
	document.getElementById("xCord").addEventListener("input", checkCoordinates);
	document.getElementById("yCord").addEventListener("input", checkCoordinates);
	document.getElementById("zCord").addEventListener("input", checkCoordinates);
}

init();
