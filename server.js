/* eslint-env node */
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

const express = require('express');
const fetch = require('node-fetch');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

// CODELAB: Change this to add a delay (ms) before the server responds.
const LOAD_DELAY = 0;

// CODELAB: If running locally, set your Dark Sky API key here
const API_KEY = process.env.DROPBOX_API_KEY;
const BASE_URL = `https://api.dropboxapi.com/2/`;

//Fake data used as a template
const fakeData = {
	fakeData: true,
	native: true,
	filename: "fakeCords.json",
	title: "My awesome map",
	locations: [
		{
			time: 0,
			timezone: 'utc',
			type: 'WitchHut',
			x: 0,
			y: 0,
			z: 0,
			description: 'Some cool fake chest',
			owner: 'User',
			link: '',
			iconIndex: 43
		}
	]
};

//Static data

/**
 * Location type data
 */
const LocationTypes = {
	"Spawn":           { description: "",                                                                                                                   iconIndex: 40 },
	"PlayerHouse":     { description: "",                                                                                                                   iconIndex: 10 },
	"PlayerCastle":    { description: "",                                                                                                                   iconIndex: 9  },
	"PlayerFarm":      { description: "",                                                                                                                   iconIndex: 14 },
	"PlayerMachine":   { description: "",                                                                                                                   iconIndex: 12 },
	"PlayerStructure": { description: "a generic catch-all block for things players have built that defy any more specific icons.",                         iconIndex: 8  },
	"EnchantingRoom":  { description: "",                                                                                                                   iconIndex: 44 },
	"Village":         { description: "",                                                                                                                   iconIndex: 0  },
	"DesertVillage":   { description: "",                                                                                                                   iconIndex: 1  },
	"SavannahVillage": { description: "",                                                                                                                   iconIndex: 0  },
	"JungleTemple":    { description: "",                                                                                                                   iconIndex: 4  },
	"DesertTemple":    { description: "",                                                                                                                   iconIndex: 5  },
	"WitchHut":        { description: "",                                                                                                                   iconIndex: 3  },
	"NetherFortress":  { description: "",                                                                                                                   iconIndex: 6  },
	"NetherPortal":    { description: "",                                                                                                                   iconIndex: 7  },
	"Forest":          { description: "",                                                                                                                   iconIndex: 28 },
	"FlowerForest":    { description: "",                                                                                                                   iconIndex: 26 },
	"MushroomIsland":  { description: "",                                                                                                                   iconIndex: 29 },
	"Horse":           { description: "",                                                                                                                   iconIndex: 34 },
	"Wolf":            { description: "",                                                                                                                   iconIndex: 35 },
	"Dragon":          { description: "a dragon. You can use it to indicate an End portal, the Ender Dragon, or just as 'Here be dragons' map decoration.", iconIndex: 36 },
	"SeaMonster":      { description: "",                                                                                                                   iconIndex: 46 },
	"Ship":            { description: "a sailing ship. You can use it to decorate the map and indicate ocean.",                                             iconIndex: 37 },
	"FenceOverlay":    { description: "",                                                                                                                   iconIndex: 13 },
	"IslandOverlay":   { description: "",                                                                                                                   iconIndex: 30 },
	"Label":	       { description: "a location-type that has no icon by default, you can use it to place plain text onto the map.",                     	iconIndex: -1 }
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
 * Generates fake data in case the file is not available.
 *
 * @param {String} location x,y,z location to use.
 * @return {Object} data object.
 */
function generateFakeData(location){
  location = location || '-1223,60,-1538';
  const cords = location.split(',', 3);
  
  // Create a new copy of the fake data
  const result = Object.assign({}, fakeData);
  result.locations[0].x = parseFloat(cords[0].trim());
  result.locations[0].y = parseFloat(cords[1].trim());
  result.locations[0].z = parseFloat(cords[2].trim());
  return result;
}

/**
 * Read in a file from dropbox and convert it to something we can use
 * @param {Object} fileData File data object from dropbox to be converted to something we can use
 * @returns {Object} Object in correct format to use in our application
 */
function readFile(fileData){

	//Create our object we will populate from the file
	const result = Object.assign({}, fakeData);

	//Get the template for the location
	const locationTemplate = Object.assign({}, result.locations[0]);
	locationTemplate.type = '';
	locationTemplate.description = '';
	locationTemplate.iconIndex = -1;

	//Clear out some values
	result.filename = '';
	result.fakeData = false;
	result.native = true;
	result.locations = [];

	//Check each important property and set any that we have
	if(title in fileData){
		result.title = fileData.title;
	}
	if(locations in fileData && Array.isArray(fileData.locations) && fileData.locations.length > 0){
		fileData.locations.forEach(element => {
			const location = Object.assign({}, locationTemplate);
			
			//Validate location data
			if(time in element){
				const time = parseInt(element.time);
				if(time !== NaN){
					location.time = time;
				}
			}
			if(timezone in element){
				location.timezone = String(element.timezone);
			}
			if(type in element && LocationTypes.hasOwnProperty(element.type)){
				location.type = element.type;
			}
			if(x in element){
				const x = parseFloat(element.x);
				if(x !== NaN){
					location.x = x;
				}
			}
			if(y in element){
				const y = parseFloat(element.y);
				if(y !== NaN){
					location.y = y;
				}
			}
			if(z in element){
				const z = parseFloat(element.z);
				if(z !== NaN){
					location.z = z;
				}
			}
			if(description in element){
				location.description = String(element.description);
			}
			if(owner in element){
				location.owner = String(element.owner);
			}
			if(link in element){
				location.link = String(element.link);
			}
			else if(href in element){
				location.link = element.href;
			}
			if(iconIndex in element){
				const iconIndex = parseInt(element.iconIndex);
				if(iconIndex > -1){
					location.iconIndex = iconIndex;
				}
			}

			//Add the location to the list
			result.locations.push(location);
		});
	}

	return result;
}

/**
 * Save application data as a json file
 * @param {fakeData} data Data formatted in same format as fakeData
 */
function saveJsonFile(data){
	const result = Object.assign({}, data);

	//Get rid of unimportant properties
	delete result.fakeData;
	delete result.native;
	delete result.filename;

	return result;
}

function getLocationTypes(req, resp){
	resp.json(LocationTypes);
}

/**
 * Get the data file for our minecraft cordinates
 * @param {Request} req request object from Express
 * @param {Response} resp response object from Express
 */
function getLocations(req, resp){
	const filename = req.params.filename || '';
	const url = `${BASE_URL}/${API_KEY}/${filename}`;
	fetch(url).then((resp) => {
		if (resp.status !== 200) {
			throw new Error(resp.statusText);
		}
		return resp.json();
	}).then((data) => {
		setTimeout(() => {
			resp.json(readFile(data));
		}, LOAD_DELAY);
	}).catch((err) => {
		console.error('Dropbox API Error:', err.message);
		resp.json(generateFakeData("-1,0,-1"));
	});
}

/**
 * Save the data file for our minecraft cordinates
 * @param {Request} req request object from Express
 * @param {Response} resp response object from Express
 */
function saveLocations(req, resp){
	const filename = req.params.filename || '';
	const url = `${BASE_URL}/${API_KEY}/${filename}`;
	fetch(url).then((resp) => {
		if (resp.status !== 200) {
			throw new Error(resp.statusText);
		}
		return resp.json();
	}).then((data) => {
		setTimeout(() => {
			resp.json(readFile(data));
		}, LOAD_DELAY);
	}).catch((err) => {
		console.error('Dropbox API Error:', err.message);
		resp.json(generateFakeData("-1,0,-1"));
	});
}

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() {
  const app = express();

  // Redirect HTTP to HTTPS,
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

  // Logging for each request
  app.use((req, resp, next) => {
    const now = new Date();
    const time = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
    const path = `"${req.method} ${req.path}"`;
    const m = `${req.ip} - ${time} - ${path}`;
    // eslint-disable-next-line no-console
    console.log(m);
    next();
  });

  // Handle requests for the data
  app.get('/locations/:filename', getLocations);
  app.get('/locations', getLocations);
  app.get('/locationtypes', getLocationTypes);
  app.post('/locations', saveLocations);

  // Handle requests for static files
  app.use(express.static('public'));

  // Start the server
  return app.listen('8000', () => {
    // eslint-disable-next-line no-console
    console.log('Local DevServer Started on port 8000...');
  });
}

startServer();
