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
	return minecordApp.addDialogContainer.classList.contains('visible');
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
	//Adding warn about overritting an existing value
	if(existingKey === ""){
		if(hasKey){
			cordError.textContent = "Coordinates match existing record, will over-write existing record.";
			cordError.classList.add('visible');
		}
		else
		{
			cordError.textContent = "";
			cordError.classList.remove('visible');
		}
	}
	else
	{
		if(hasKey){
			if(existingKey !== key){
				cordError.textContent = "Coordinates have changed to another record, will over-write that one instead.";
				cordError.classList.add('visible');
			}
			else
			{
				cordError.textContent = "";
				cordError.classList.remove('visible');
			}
		}
		else
		{
			cordError.textContent = "";
			cordError.classList.remove('visible');
		}
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

	//Get the icon dropdown
	const selectIcon = document.getElementById('selectIconIndex');
	const selectedIcon = selectIcon.options[selectIcon.selectedIndex];
	const iconIndex = selectedIcon.value;

	//Set all the data about a location
	const location = new MinecordLocation(type, xCord.value, yCord.value, zCord.value, description.value, owner.value, url.value, iconIndex);

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
		const urlParse = /(?<protocol>\w*)\:\/\/(?:(?:(?<thld>[\w\-]*)(?:\.))?(?<sld>[\w\-]*))\.(?<tld>\w*)(?:\:(?<port>\d*))?.*\/(?<filename>[\w-]+)\.(?<ext>jpg|png|txt)/g.exec(location.url);
		let displayedName = location.url.substr(-10);
		let fileExtention = "";
		let domain = "";
		if(urlParse != null && urlParse.length > 0 && urlParse.groups){
			displayedName = urlParse.groups["filename"] || displayedName;
			fileExtention = urlParse.groups["ext"] || "";
			if(urlParse.groups["sld"] && urlParse.groups["tld"]){
				domain = (urlParse.groups["thld"] ? urlParse.groups["thld"] + "." : "") + urlParse.groups["sld"] + "." + urlParse.groups["tld"];
			}
		}
		if(domain === "dropbox.com"){
			urlCtrl.innerHTML = `<a href="${location.url}" class="dropbox-embed" data-height="300px" data-width="500px"></a>`;
		}
		else if(domain === "dl.dropboxusercontent.com" && ["png","jpeg","gif"].includes(fileExtention)){
			urlCtrl.innerHTML = `<figure>
				<img src="${location.url}" alt="${displayedName}">
				<figcaption><a href="${location.url}" target="_blank">${displayedName}</a></figcaption>
			</figure>`;
		}
		else{
			urlCtrl.innerHTML = `<a href="${location.url}" target="_blank">${displayedName}</a>`;
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
	settingsCard.querySelector(".setting-range").textContent = mapSettings.range;
	settingsCard.querySelector(".setting-show-origin").textContent = mapSettings.showOrigin ? "Show" : "Don't Show";
	settingsCard.querySelector(".setting-origin").textContent = mapSettings.origin.x + ", " + mapSettings.origin.z;
	settingsCard.querySelector(".setting-show-scale").textContent = mapSettings.showScale ? "Scale" : "No Scale";
	settingsCard.querySelector(".setting-show-coordinates").textContent = mapSettings.showCoordinates ? "Show Coordinates" : "Hide Coordinates";
	settingsCard.querySelector(".setting-hide-label-above").innerHTML = `<b>Hide Labels Above:</b> <a>${mapSettings.hideLabelsAbove}</a>`;
	const iconFileGroup = settingsCard.querySelector(".setting-custom-icon-file");
	iconFileGroup.querySelector(".image-path").textContent = mapSettings.customIconFile || "";
	const img = iconFileGroup.querySelector("figure > img");
	img.src = mapSettings.customIconFile || "";
	img.alt = mapSettings.customIconFile || "";
	iconFileGroup.querySelector("figure > figcaption").textContent = mapSettings.customIconFile || "";
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
