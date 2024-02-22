# maps
These are various custom web maps created for travel and tourism purposes.

These utilize Chris Arderne's solution using PapaParse.js**
https://github.com/carderne/leaflet-gsheets

## nassau
Points of interest for a walking tour of Nassau Bahamas.
Based on code from:
https://github.com/jsoma/mapsheet
I've not been able to get the color coded marker pins working. Relies on the now obsolete Tabletop.js.


## burnsville
 Sightseeing points of interest in the Appalachian mountains around Burnsville, NC
 Also based on code from:
https://github.com/jsoma/mapsheet
Still no color-coded markers.

## texas-campgrounds
 Locations of promising campsites for tent camping in Texas. Based on **The Best in Tent Camping Texas** by Wendel Withrow.
Based on code from:
https://github.com/carderne/leaflet-gsheets
Finally! Color coded markers! This codebase made the switch from Tabletop.js to PapaParse.js to overcome a data access issue imposed by Google during 2020.

## Galveston Tourist Map

This interactive map was created in preparation for a vacation to Galveston, TX for the purpose of aggregating sightseeing destinations and points of interest onto an easily accessed webmap.

### Components

1. index.html - essentially only the page title needs to be customized here. Everything else is links to codebase already in my Github "maps" directory.
2. main.js - this javascrip must be heavily customized for this dataset, providing links to 1 or 2 publicly shared google sheets data files. This data populates the map pins or shapes. Also the type of basemap and centerpoint and zoom level must be set as desired.
3. Data stored in Google Sheets.

### Map Data

Points of interest Google Sheet - https://docs.google.com/spreadsheets/d/1LL-Uphh93pzNv1bZbWHnHAUJr3eC-4cOBwO3KTFle88/edit?usp=sharing
Downtown Trolley Route is a geojson polygon traced from a map.

Data is fetched from the Google Sheets and converted from CSV into the DOM using [Papa Parse](https://www.papaparse.com/). The map then displays the data points.

Much of the information about points of interest to tourists was gleaned from the work of J.R. Shaw and his [Galveston Unscripted](https://www.galvestonunscripted.com/) podcast and audio tours.
