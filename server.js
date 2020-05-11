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
const helmet = require('helmet');
const fetch = require('node-fetch');
const fs = require('fs');
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
 * Any static data we will use in this app
 */
const AppData = {
	LocationTypes: {}
};

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
			if(type in element && AppData.LocationTypes.hasOwnProperty(element.type)){
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

  const locationTypesContent = fs.readFileSync('public/data/LocationTypes.json');
  AppData.LocationTypes = JSON.parse(locationTypesContent);

  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
	  directives: {
		defaultSrc: ["'self'"],
		connectSrc: ["'self'","https://*.dropbox.com","https://*.dropboxusercontent.com"],
		scriptSrc: ["'self'","https://www.dropbox.com/static/api/2/dropins.js","'unsafe-inline'"],
		styleSrc: ["'self'","'unsafe-inline'"], 
		fontSrc: ["'self'", "data:"],
		imgSrc: ["'self'","https://*.dropboxusercontent.com","https://*.dropbox.com"],  
		mediaSrc: ["'none'"],  
		frameSrc: ["https://www.dropbox.com/"] 
	  },
	  setAllHeaders: true
  }));

  //cookie security for production: only via https
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

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
