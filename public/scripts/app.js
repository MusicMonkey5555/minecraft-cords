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

const minecordApp = {
	filename: "",
	title: "",
	native: true,
	selectedLocations: {},
	addDialogContainer: document.getElementById('addDialogContainer'),
	pageSpinner: document.getElementById('pageSpinner'),
	locationTypes: {},
	iconClasses: [],
	owners: {}
};

/**
 * Toggles the visibility of the add location dialog box.
 */
function toggleAddDialog() {
	minecordApp.addDialogContainer.classList.toggle('visible');
}

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation() {
  // Hide the dialog
  toggleAddDialog();

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
  const location = {type: type, x: xCord.value, y: yCord.value, z: zCord.value, description: description.value, owner: owner.value, url: url.value, iconIndex: iconIndex };
  
  // Create a new card & get the weather data from the server
  const card = getItemCard(location);

  renderLocation(card, {time: Date.now(), timezone: 'utc'})

  /*
  getLocationFromNetwork(type).then((forecast) => {
    renderForecast(card, forecast);
  });
  */

  // Save the updated list of locations.
  const key = location.x + "|" + location.y + "|" + location.z;
  minecordApp.selectedLocations[key] = location;
  saveLocationList(minecordApp.selectedLocations);

  //Update list of owners and save it and update the menu for next time
  if(!(location.owner in minecordApp.owners)){
	  minecordApp.owners[location.owner] = {count: 0};
  }
  minecordApp.owners[location.owner].count++;
  saveOwnerList(minecordApp.owners);
  updateOwnersList();
}

/**
 * Event handler for .remove-item, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
	const parent = evt.srcElement.parentElement;
	parent.remove();
	if (minecordApp.selectedLocations[parent.id]) {

		//Update the owner list and save it and update the menu
		const location = minecordApp.selectedLocations[parent.id];
		if (minecordApp.owners[location.owner]) {
			var owner = minecordApp.owners[location.owner];
			owner.count = owner.count > 0 ? owner.count - 1 : 0;
		}
		saveOwnerList(minecordApp.owners);
		updateOwnersList();

		delete minecordApp.selectedLocations[parent.id];
		saveLocationList(minecordApp.selectedLocations);
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

	const updatedLast = luxon.DateTime
		.fromMillis(data.time)
		//.setZone(data.timezone)
		.toFormat('DDDD t');
	card.querySelector('.date').textContent = updatedLast;

	//Update location type icon
	const locTypeLabel = card.querySelector('.info .loc-type-label');
	const locTypeIconClass = getLocationTypeIconClass(locTypeLabel.textContent);
	card.querySelector('.info .loc-type').className = `loc-type ${locTypeIconClass}`;

	//Update icon index icon
	const iconIndex = card.querySelector('.info .icon-index-label').textContent;
	const iconIndexClass = minecordApp.iconClasses[iconIndex];
	card.querySelector('.info .icon-index-name').textContent = iconIndexClass;
	card.querySelector('.info .icon-index').className = `icon-index ${iconIndexClass}`;

	// If the loading spinner is still visible, remove it.
	const spinner = card.querySelector('.card-spinner');
	if (spinner) {
		card.removeChild(spinner);
	}
}

/**
 * Get's the HTML element for the x-y-z data, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} location Location object
 * @return {Element} The element for the location card.
 */
function getItemCard(location) {
	const id = location.x + "|" + location.y + "|" + location.z;
	const card = document.getElementById(id);
	if (card) {
		return card;
	}
	const newCard = document.getElementById('item-template').cloneNode(true);
	newCard.querySelector('.location').textContent = location.x + "," + location.y + "," + location.z;
	newCard.setAttribute('id', id);

	//fill out the other data
	newCard.querySelector('.description').textContent = location.description;
	newCard.querySelector('.owner').textContent = location.owner;

	//Set the location type text
	newCard.querySelector('.info .loc-type-label').textContent = location.type;

	newCard.querySelector('.url').textContent = location.url;

	newCard.querySelector('.info .icon-index-label').textContent = location.iconIndex;

	newCard.querySelector('.remove-item')
		.addEventListener('click', removeLocation);
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
	renderAllCards();
}

function updateLocationTypeDropdown(){
	//Update the add dialogue
	const selectType = document.getElementById('selectLocationType');
	
	//Get our html options
	let output = "";
	Object.keys(minecordApp.locationTypes).forEach((key) => {
		const type = minecordApp.locationTypes[key];
		//const iconClass = getLocationTypeIconClass(type);

		output += `<option value="${key}" title="${type.description}">${key}</option>`;
	});

	//update the actual select menu
	selectType.innerHTML = output;
}

function updateIconClasses(iconClasses){
	minecordApp.iconClasses = iconClasses;

	//Update add menu dialogue select menu
	updateIconIndexDropdown();

	//Update all the cards
	renderAllCards();
}

function updateIconIndexDropdown(){
	//Update the add dialogue
	const selectIconIndex = document.getElementById('selectIconIndex');
	
	//Get our html options
	let output = "";
	minecordApp.iconClasses.forEach((iconClass, i) => {
		output += `<option value="${i}"><div class="icon-index ${iconClass}"></div> ${iconClass}</option>`;
	});

	//update the actual select menu
	selectIconIndex.innerHTML = output;
}

function updateOwnersList(){
	//Update the add dialogue
	const ownerList = document.getElementById('owners');
	
	//Get our html options
	let output = "";
	Object.keys(minecordApp.owners)
	.sort((a,b) => {return minecordApp.owners[a].count - minecordApp.owners[b].count;})
	.forEach((key) => {
		const owner = minecordApp.owners[key];

		output += `<option value="${key}">`;
	});

	//update the actual menu
	ownerList.innerHTML = output;
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
	var iconClass = "";

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

	Object.keys(minecordApp.selectedLocations).forEach((key) => {
		const location = minecordApp.selectedLocations[key];
		const card = getItemCard(location);
		// CODELAB: Add code to call getForecastFromCache

		// Get the forecast data from the network.
		/*
		getLocationFromNetwork(location.geo)
			.then((forecast) => {
			  renderForecast(card, forecast);
			});
			*/
	});
}

function renderAllCards() {
	Object.keys(minecordApp.selectedLocations).forEach((key) => {
		const location = minecordApp.selectedLocations[key];

		//This should get an existing card
		const card = getItemCard(location);

		renderLocation(card, { time: Date.now(), timezone: 'utc' });
	});
}

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
  const data = JSON.stringify(locations);
  localStorage.setItem('locationList', data);
}

/**
 * Loads the list of saved location.
 *
 * @return {Object}
 */
function loadLocationList() {
  let locations = localStorage.getItem('locationList');
  if (locations) {
    try {
      locations = JSON.parse(locations);
    } catch (ex) {
      locations = {};
    }
  }
  if (!locations || Object.keys(locations).length === 0) {
    const key = '0|0|0';
    locations = {};
    locations[key] = {type: 'WitchHut', x: 0, y: 0, z: 0, description: "Some cool fake chest", owner: "User", url: "", iconIndex: 43 };
  }
  return locations;
}

/**
 * Saves list of owners we have typed in before
 * @param {Object} owners Map of owners we have previously typed in
 */
function saveOwnerList(owners){
	const data = JSON.stringify(owners);
	localStorage.setItem('ownerList', data);
}

/**
 * Loads the list of owners we have typed in before
 *
 * @return {Object} map of owners typed in
 */
function loadOwnerList() {
	let owners = localStorage.getItem('ownerList');
	if (owners) {
	  try {
		owners = JSON.parse(owners);
	  } catch (ex) {
		owners = {};
	  }
	}
	if (!owners || Object.keys(owners).length === 0) {
		owners = {"MusicMonkey5555": {count: 1}};
	}
	return owners;
  }

/**
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
	// Get the location list
	minecordApp.selectedLocations = loadLocationList();

	//Get the owner list
	minecordApp.owners = loadOwnerList();
	updateOwnersList();

	//add all our cards
	updateData();

	//Load all our static lookup data
	loadLocationTypes();
	loadIconClasses();

	// Set up the event handlers for all of the buttons.
	document.getElementById('butRefresh').addEventListener('click', updateData);
	document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
	document.getElementById('butDialogCancel').addEventListener('click', toggleAddDialog);
	document.getElementById('butDialogAdd').addEventListener('click', addLocation);

	// Set up the event handlers for dialogue
	document.getElementById("selectLocationType").addEventListener("change", (event) => {
		const locationType = minecordApp.locationTypes[event.target.value];
		document.getElementById("selectIconIndex").value = locationType.iconIndex;
	});
	document.getElementById("selectIconIndex").addEventListener("change", (event) => {
		const iconClass = minecordApp.iconClasses[event.target.value];
		document.getElementById("selectIconIndexIcon").className = `icon-index ${iconClass}`;
	});
}

init();
