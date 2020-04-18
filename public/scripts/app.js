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
};

//Static data

/**
 * Location type data
 */
const LocationTypes = {
	"Spawn":           { description: "",                                                                                                                   iconIndex: -1 },
	"PlayerHouse":     { description: "",                                                                                                                   iconIndex: -1 },
	"PlayerCastle":    { description: "",                                                                                                                   iconIndex: -1 },
	"PlayerFarm":      { description: "",                                                                                                                   iconIndex: -1 },
	"PlayerMachine":   { description: "",                                                                                                                   iconIndex: -1 },
	"PlayerStructure": { description: "a generic catch-all block for things players have built that defy any more specific icons.",                         iconIndex: -1 },
	"EnchantingRoom":  { description: "",                                                                                                                   iconIndex: -1 },
	"Village":         { description: "",                                                                                                                   iconIndex: -1 },
	"DesertVillage":   { description: "",                                                                                                                   iconIndex: 1 },
	"SavannahVillage": { description: "",                                                                                                                   iconIndex: 0 },
	"JungleTemple":    { description: "",                                                                                                                   iconIndex: -1 },
	"DesertTemple":    { description: "",                                                                                                                   iconIndex: -1 },
	"WitchHut":        { description: "",                                                                                                                   iconIndex: -1 },
	"NetherFortress":  { description: "",                                                                                                                   iconIndex: -1 },
	"NetherPortal":    { description: "",                                                                                                                   iconIndex: -1 },
	"Forest":          { description: "",                                                                                                                   iconIndex: -1 },
	"FlowerForest":    { description: "",                                                                                                                   iconIndex: -1 },
	"MushroomIsland":  { description: "",                                                                                                                   iconIndex: -1 },
	"Horse":           { description: "",                                                                                                                   iconIndex: -1 },
	"Wolf":            { description: "",                                                                                                                   iconIndex: -1 },
	"Dragon":          { description: "a dragon. You can use it to indicate an End portal, the Ender Dragon, or just as 'Here be dragons' map decoration.", iconIndex: -1 },
	"SeaMonster":      { description: "",                                                                                                                   iconIndex: -1 },
	"Ship":            { description: "a sailing ship. You can use it to decorate the map and indicate ocean.",                                             iconIndex: -1 },
	"FenceOverlay":    { description: "",                                                                                                                   iconIndex: -1 },
	"IslandOverlay":   { description: "",                                                                                                                   iconIndex: -1 },
	"Label":	       { description: "a location-type that has no icon by default , you can use it to place plain text onto the map.",                     iconIndex: -1 }
};

/**
 * These all correspond to the icon css class and the index in the array to the icon-index on https://buildingwithblocks.info/map173/index.html?src=legend.txt
 */
const IconClasses = [
  "SavannahVillage",
  "DesertVillage",
  "Skull",
  "WhitchHut",
  "JungleTemple",
  "DesertTemple",
  "NetherFortress",
  "NetherPortal",
  "PlayerStructure",
  "PlayerCastle",
  "PlayerHouse",
  "RailwayStructure",
  "PlayerMachine",
  "FenceOverlay",
  "PlayerFarm",
  "Chicken",
  "Pig",
  "Cow",
  "Sheep",
  "Pumpkin",
  "MonumentSarsenStones",
  "MonumentObelisk",
  "MonumentMaoi",
  "ForestOak",
  "ForestSampling",
  "ForestPiratePalms",
  "ForestFlowerForest",
  "ForestDark",
  "Forest",
  "MushroomIsland",
  "IslandOverlay",
  "IcePlainsSpikes",
  "Mountains1",
  "Mountains2",
  "Cave",
  "Horse",
  "Wolf",
  "Dragon",
  "SeaMonster",
  "Ship1",
  "Ship2",
  "CompassRose",
  "Spawn",
  "Marker2",
  "Marker3",
  "Chest",
  "EnchantingRoom",
  "Anvil"
];

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

  renderLocation(card, {time: Date.now()})

  /*
  getLocationFromNetwork(type).then((forecast) => {
    renderForecast(card, forecast);
  });
  */

  // Save the updated list of locations.
  const key = location.x + "|" + location.y + "|" + location.z;
  minecordApp.selectedLocations[key] = location;
  saveLocationList(minecordApp.selectedLocations);
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
		.fromSeconds(data.time)
		.setZone(data.timezone)
		.toFormat('DDDD t');
	card.querySelector('.date').textContent = updatedLast;

	// If the loading spinner is still visible, remove it.
	const spinner = card.querySelector('.card-spinner');
	if (spinner) {
		card.removeChild(spinner);
	}
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
 * Get's the cached location data from the caches object.
 *
 * @param {String} cords Cords of location object to get.
 * @return {Object} The location data, if the request fails, return null.
 */
function getLocationFromCache(cords) {
  // CODELAB: Add code to get weather forecast from the caches object.

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

	if(LocationTypes.hasOwnProperty(locationType)){
		const type = LocationTypes[locationType];
		if(type.hasOwnProperty("iconIndex") && type.iconIndex > -1 && type.iconIndex < IconClasses.length){
			iconClass = IconClasses[type.iconIndex];
		}
	}

	return iconClass;
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

  const locType = newCard.querySelector('.info .loc-type');

  //Lookup the icon for this location type and set the class on the div
  locType.textContent = location.type;
  const locTypeIconClass = getLocationTypeIconClass(location.type);
  locType.className = `loc-type ${locTypeIconClass}`;

  newCard.querySelector('.url').textContent = location.url;
  
  const iconIndexDiv = newCard.querySelector('.info .icon-index');
  iconIndexDiv.textContent = location.iconIndex + " - " + IconClasses[location.iconIndex];
  const iconIndexClass = IconClasses[location.iconIndex]; 
  iconIndexDiv.className = `icon-index ${iconIndexClass}`;

  newCard.querySelector('.remove-item')
      .addEventListener('click', removeLocation);
  document.querySelector('main').appendChild(newCard);
  newCard.removeAttribute('hidden');
  return newCard;
}


/**
 * Gets the latest location data and updates each card with the
 * new data.
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
	renderLocation(card, {time: Date.now()});
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
 * @return {Array}
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
    locations[key] = {type: Chest, x: 0, y: 0, z: 0, description: "Some cool fake chest", owner: "User", url: "", iconIndex: 43 };
  }
  return locations;
}

/**
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
  // Get the location list, and update the UI.
  minecordApp.selectedLocations = loadLocationList();
  updateData();

  // Set up the event handlers for all of the buttons.
  document.getElementById('butRefresh').addEventListener('click', updateData);
  document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
  document.getElementById('butDialogCancel').addEventListener('click', toggleAddDialog);
  document.getElementById('butDialogAdd').addEventListener('click', addLocation);
}

init();
