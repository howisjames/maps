/* global L Papa */

/*
 * Script to display two tables from Google Sheets as point and geometry layers using Leaflet
 * The Sheets are then imported using PapaParse and overwrite the initially laded layers
 */

// PASTE YOUR URLs HERE
// these URLs come from Google Sheets 'shareable link' form
// the first is the geometry layer and the second the points
 let geomURL =   "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9L4k5qK9m2FBoeUbB0HRQSOcLQBEbA7CjPtVlejRriM3C15Hb5KNR6BwdvAOf508q37OtG4TEryRN/pub?output=csv";
let pointsURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_TlrZyt4tBNn3MEPN1zIFkB_v-Zr8iOf4k2HCO_656gBgFEYKYn6i1yAml1oT68lNjxLd50XIMmhy/pub?output=csv";

window.addEventListener("DOMContentLoaded", init);

let map;
let sidebar;
let panelID = "my-info-panel";

/*
 * init() is called when the page has loaded
 */
function init() {
  // Create a new Leaflet map centered on the continental US
  map = L.map("map").setView([25.079, -77.358], 10);

  // This is the basemap tiles

// Tile type: openstreetmap normal
var openstreetmap = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  maxZoom: 19
})

// Tile type: openstreetmap Hot
var openstreetmapHot = L.tileLayer(
  'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  maxZoom: 19
})

// Tile type: openstreetmap Osm
var openstreetmapOsm = L.tileLayer(
  'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  maxZoom: 19
})

//Base layers definition and addition
var allOptions = {
  "Open streetmap": openstreetmap,
  "Open streetmap: Hot": openstreetmapHot,
  "Open streetmap: Osm": openstreetmapOsm
};

// Initialize with openstreetmap
openstreetmap.addTo(map);

// Add baseLayers to map as control layers
L.control.layers(allOptions).addTo(map);

// ------------------------

//  L.tileLayer(
//    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//    {
//      attribution:
//        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//      subdomains: "abcd",
//      maxZoom: 19,
//    }
//  ).addTo(map);

  sidebar = L.control
    .sidebar({
      container: "sidebar",
      closeButton: true,
      position: "right",
    })
    .addTo(map);

  let panelContent = {
    id: panelID,
    tab: "<i class='fa fa-bars active'></i>",
    pane: "<p id='sidebar-content'></p>",
    title: "<h2 id='sidebar-title'>Nothing selected</h2>",
  };
  sidebar.addPanel(panelContent);

  map.on("click", function () {
    sidebar.close(panelID);
  });

  // Use PapaParse to load data from Google Sheets
  // And call the respective functions to add those to the map.
  Papa.parse(geomURL, {
    download: true,
    header: true,
    complete: addGeoms,
  });
  Papa.parse(pointsURL, {
    download: true,
    header: true,
    complete: addPoints,
  });
}

/*
 * Expects a JSON representation of the table with properties columns
 * and a 'geometry' column that can be parsed by parseGeom()
 */
function addGeoms(data) {
  data = data.data;
  // Need to convert the PapaParse JSON into a GeoJSON
  // Start with an empty GeoJSON of type FeatureCollection
  // All the rows will be inserted into a single GeoJSON
  let fc = {
    type: "FeatureCollection",
    features: [],
  };

  for (let row in data) {
    // The Sheets data has a column 'include' that specifies if that row should be mapped
    if (data[row].include == "y") {
      let features = parseGeom(JSON.parse(data[row].geometry));
      features.forEach((el) => {
        el.properties = {
          name: data[row].name,
          description: data[row].description,
        };
        fc.features.push(el);
      });
    }
  }

  // The geometries are styled slightly differently on mouse hovers
  let geomStyle = { color: "#f5f542", fillColor: "#99d8c9", weight: 2, opacity: 0 };
  let geomHoverStyle = { color: "yellow", fillColor: "#f5f542", weight: 3 };

  L.geoJSON(fc, {
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseout: function (e) {
          e.target.setStyle(geomStyle);
        },
        mouseover: function (e) {
          e.target.setStyle(geomHoverStyle);
        },
        click: function (e) {
          // This zooms the map to the clicked geometry
          // Uncomment to enable
          // map.fitBounds(e.target.getBounds());

          // if this isn't added, then map.click is also fired!
          L.DomEvent.stopPropagation(e);

          document.getElementById("sidebar-title").innerHTML =
            e.target.feature.properties.name;
          document.getElementById("sidebar-content").innerHTML =
            e.target.feature.properties.description;
          sidebar.open(panelID);
        },
      });
    },
    style: geomStyle,
  }).addTo(map);
}

/*
 * addPoints is a bit simpler, as no GeoJSON is needed for the points
 */
function addPoints(data) {
  data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

  // Choose marker type. Options are:
  // (these are case-sensitive, defaults to marker!)
  // marker: standard point with an icon
  // circleMarker: a circle with a radius set in pixels
  // circle: a circle with a radius set in meters
  let markerType = "marker";

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 100;

  for (let row = 0; row < data.length; row++) {
    let marker;
    if (markerType == "circleMarker") {
      marker = L.circleMarker([data[row].lat, data[row].lon], {
        radius: markerRadius,
      });
    } else if (markerType == "circle") {
      marker = L.circle([data[row].lat, data[row].lon], {
        radius: markerRadius,
      });
    } else {
      marker = L.marker([data[row].lat, data[row].lon]);
    }
    marker.addTo(pointGroupLayer);

    // UNCOMMENT THIS LINE TO USE POPUPS
 //   marker.bindPopup('<h2>' + data[row].site + '</h2>');

    // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
	// add cost and url for each site to the description in the sidebar
    marker.feature = {
      properties: {
        name: data[row].site,
        description: data[row].description,
      },
    };
    marker.on({
      click: function (e) {
        L.DomEvent.stopPropagation(e);
        document.getElementById("sidebar-title").innerHTML =
          e.target.feature.properties.name;
        document.getElementById("sidebar-content").innerHTML =
          e.target.feature.properties.description;
        sidebar.open(panelID);
      },
    });
    // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS

    // AwesomeMarkers is used to create fancier icons
    let icon = L.AwesomeMarkers.icon({
      icon: "info-circle",
      iconColor: "white",
      markerColor: data[row].color,
      prefix: "fa",
      extraClasses: "fa-rotate-0",
    });
    if (!markerType.includes("circle")) {
      marker.setIcon(icon);
    }
  }
}

/*
 * Accepts any GeoJSON-ish object and returns an Array of
 * GeoJSON Features. Attempts to guess the geometry type
 * when a bare coordinates Array is supplied.
 */
function parseGeom(gj) {
  // FeatureCollection
  if (gj.type == "FeatureCollection") {
    return gj.features;
  }

  // Feature
  else if (gj.type == "Feature") {
    return [gj];
  }

  // Geometry
  else if ("type" in gj) {
    return [{ type: "Feature", geometry: gj }];
  }

  // Coordinates
  else {
    let type;
    if (typeof gj[0] == "number") {
      type = "Point";
    } else if (typeof gj[0][0] == "number") {
      type = "LineString";
    } else if (typeof gj[0][0][0] == "number") {
      type = "Polygon";
    } else {
      type = "MultiPolygon";
    }
    return [{ type: "Feature", geometry: { type: type, coordinates: gj } }];
  }
}
