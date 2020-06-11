// ==UserScript==
// @id             iitc-plugin-dronerange@wintervorst
// @name           IITC plugin: Drone range
// @category       Layer
// @version        0.0.3.20200611.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/dronerange/dronerange.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/dronerange/dronerange.user.js
// @description    [iitc-20200611.013370] Draws the action radius for a drone per portal
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==

var L; // to prevent script errors on load
var $; // to prevent script errors on load
var map; // to prevent script errors on load

function wrapper(plugin_info) {
  // ensure plugin framework is there, even if iitc is not yet loaded
  if (typeof window.plugin !== 'function') window.plugin = function () { };

  //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
  //(leaving them in place might break the 'About IITC' page or break update checks)
  plugin_info.buildName = 'iitc';
  plugin_info.dateTimeVersion = '20200611.013370';
  plugin_info.pluginId = 'Dronerange';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.dronerange = function () { };
  window.plugin.dronerange.layerlist = {};
  window.plugin.dronerange.currentportal;
  window.plugin.dronerange.cellLevel = 16 ;
  window.plugin.dronerange.circleradius = 495;
  window.plugin.dronerange.cellOptions = {fill: true, color: 'teal', fillColor:'teal', opacity: 1, weight: 3, fillOpacity:0.10, clickable: false, interactive: false };

  window.plugin.dronerange.update = function () {
    if (!window.map.hasLayer(window.plugin.dronerange.dronerangeLayers))
      return;

    if (window.map.hasLayer(window.plugin.dronerange.dronerangeLayers)) {
      window.plugin.dronerange.dronerangeLayers.clearLayers();

      $.each(window.portals, function (i, portal) {
        window.plugin.dronerange.draw(portal);
      });
    }
  }

  window.plugin.dronerange.bounds;
window.plugin.dronerange.seenCells = {};
  window.plugin.dronerange.drawCells = function (portalLatLng, cellSize, cellOptions, layer) {
    var cell = S2.S2Cell.FromLatLng(portalLatLng, window.plugin.dronerange.cellLevel);
      window.plugin.dronerange.seenCells = {};
      console.log(portalLatLng);
    window.plugin.dronerange.drawCellAndNeighbors(layer, cell, cellSize, cellOptions, portalLatLng);

  }

  window.plugin.dronerange.drawCellAndNeighbors = function (layer, cell, cellSize, cellOptions, center) {
      console.log(center);
    var cellStr = cell.toString();

      if (!window.plugin.dronerange.seenCells[cellStr]) {
        // cell not visited - flag it as visited now
        window.plugin.dronerange.seenCells[cellStr] = true;
    // is it on the screen?
    var corners = cell.getCornerLatLngs();
    var cellBounds = L.latLngBounds([corners[0], corners[1]]).extend(corners[2]).extend(corners[3]);

    // Only draw filled cells when they are completely on screen because we must likely calculate something in it
   if (cellBounds.intersects(window.plugin.dronerange.bounds)) {
      // on screen - draw it

        var distance_one = center.distanceTo(corners[0]);
      var distance_two = center.distanceTo(corners[1]);
      var distance_three = center.distanceTo(corners[2]);
      var distance_four = center.distanceTo(corners[3]);
       var radius = window.plugin.dronerange.circleradius;
       if (distance_one < radius ||distance_two < radius ||  distance_three < radius || distance_four < radius) {


      window.plugin.dronerange.drawCell(layer, cell, cellSize, cellOptions);

      // and recurse to our neighbors
      var neighbors = cell.getNeighbors();
      for (var i = 0; i < neighbors.length; i++) {
        window.plugin.dronerange.drawCellAndNeighbors(layer, neighbors[i], cellSize, cellOptions, center);
      }
    }
   }

      }

  }

  window.plugin.dronerange.drawCell = function (layer, cell, cellSize, cellOptions) {
    var name = '';

    // corner points
    var corners = cell.getCornerLatLngs();

    var mapBounds = map.getBounds();

    // center point
    var center = cell.getLatLng();

    if (cellOptions.fill) {
      var region = L.geodesicPolygon([corners[0], corners[1], corners[2], corners[3]], cellOptions);
    } else {
      var region = L.geodesicPolyline([corners[0], corners[1], corners[2]], cellOptions);
    }

    // move the label if we're at a high enough zoom level and it's off screen
    if (map.getZoom() >= 9) {
      var namebounds = map.getBounds().pad(-0.1); // pad 10% inside the screen bounds
      if (!namebounds.contains(center)) {
        // name is off-screen. pull it in so it's inside the bounds
        var newlat = Math.max(Math.min(center.lat, namebounds.getNorth()), namebounds.getSouth());
        var newlng = Math.max(Math.min(center.lng, namebounds.getEast()), namebounds.getWest());

        var newpos = L.latLng(newlat, newlng);

        // ensure the new position is still within the same cell
        var newposcell = S2.S2Cell.FromLatLng(newpos, 6);
        if (newposcell.toString() == cell.toString()) {
          center = newpos;
        }
        // else we leave the name where it was - offscreen
      }
    }

    layer.addLayer(region);
  }

  window.plugin.dronerange.setSelected = function (a) {
    if (a.display) {
      var selectedLayer = window.plugin.dronerange.layerlist[a.name];
      if (selectedLayer !== undefined) {
        if (!window.map.hasLayer(selectedLayer)) {
          window.map.addLayer(selectedLayer);
        }
        if (window.map.hasLayer(selectedLayer)) {
          window.plugin.dronerange.update();
        }
      }
    }
  }

  // Define and add the dronerange circles for a given portal
  window.plugin.dronerange.draw = function (portal) {
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = { color: 'black', opacity: 0.5, fillColor: 'grey', fillOpacity: 0.05, weight: 1, clickable: false, interactive: false };
    var range = 300; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the dronerange draw layer
    circle.addTo(window.plugin.dronerange.dronerangeLayers);
  }

  window.plugin.dronerange.flightplanportals = {};
  window.plugin.dronerange.flightplanportallayers = {};
  window.plugin.dronerange.portalSelected = function (portal) {
    if (window.plugin.dronerange.currentportal !== portal.selectedPortalGuid) {
      //console.log(portal);
      var porsec = window.portals[portal.selectedPortalGuid];
      //if (window.plugin.dronerange.flightplanportals[portal.selectedPortalGuid] === undefined) {
//        window.plugin.dronerange.flightplanportals[portal.selectedPortalGuid] = porsec;
        window.plugin.dronerange.drawFlightPlan(window.portals[portal.selectedPortalGuid]);
  //    } else if (portal.selectedPortalGuid !== portal.unselectedPortalGuid) {
//        var layer = window.plugin.dronerange.flightplanportallayers[porsec.options.guid];
//        layer.bindPopup("ga je gang", porsec.getLatLng()).openPopup();
//      }
    }
  }

  window.plugin.dronerange.flightpoints = [];
  window.plugin.dronerange.flightpointskey = "dronerangeflightpoints";

  window.plugin.dronerange.drawFlightPlan = function (portal) {
      window.plugin.dronerange.dronerangeFlightplanLayers.clearLayers();
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = { color: 'black', opacity: 0.5, fillColor: 'grey', fillOpacity: 0.05, weight: 1, clickable: false, interactive: false };
    var range = window.plugin.dronerange.circleradius; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the dronerange draw layer
    console.log(portal);
    circle.addTo(window.plugin.dronerange.dronerangeFlightplanLayers);
    window.plugin.dronerange.flightplanportallayers[portal.options.guid] = circle;
    //window.plugin.dronerange.addflightpoint(portal);

      window.plugin.dronerange.bounds= circle.getBounds();
    window.plugin.dronerange.drawCells(latlng, window.plugin.dronerange.cellLevel, window.plugin.dronerange.cellOptions, window.plugin.dronerange.dronerangeFlightplanLayers)
  }

  window.plugin.dronerange.addflightpoint = function (portal) {
    var index = window.plugin.dronerange.flightpoints.length;
    var flightpoint = {
      portal: portal,
      index: index
    };

    if (index > 0) {

      var sourceLatLng = window.plugin.dronerange.flightpoints[index - 1].portal.getLatLng();
      var targetLatLng = portal.getLatLng();
      var shortestDistance = sourceLatLng.distanceTo(targetLatLng);

      var poly = L.geodesicPolyline([sourceLatLng, targetLatLng], {
        color: 'orange',
        opacity: 1,
        weight: 3,
        clickable: false,
        dashArray: 5,
        html: shortestDistance
      }).addTo(window.plugin.dronerange.dronerangeFlightplanLayers);
    }

    window.plugin.dronerange.flightpoints.push(flightpoint);
  }


  // Initialize the plugin and display droneranges if at an appropriate zoom level
  var setup = function () {

    window.plugin.dronerange.dronerangeLayers = new L.LayerGroup();
    window.addLayerGroup('Drone range', window.plugin.dronerange.dronerangeLayers, true);


    window.plugin.dronerange.dronerangeFlightplanLayers = new L.LayerGroup();
    window.addLayerGroup('Drone flightplan', window.plugin.dronerange.dronerangeFlightplanLayers, true);

    window.plugin.dronerange.layerlist['Drone range'] = window.plugin.dronerange.dronerangeLayers;
    addHook('mapDataRefreshEnd', window.plugin.dronerange.update);
    window.pluginCreateHook('displayedLayerUpdated');

    window.addHook('displayedLayerUpdated', window.plugin.dronerange.setSelected);
    window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;

    window.addHook('portalSelected', window.plugin.dronerange.portalSelected);
  }

  // Overload for IITC default in order to catch the manual select/deselect event and handle it properly
  // Update layerGroups display status to window.overlayStatus and localStorage 'ingress.intelmap.layergroupdisplayed'
  window.updateDisplayedLayerGroupModified = function (name, display) {
    overlayStatus[name] = display;
    localStorage['ingress.intelmap.layergroupdisplayed'] = JSON.stringify(overlayStatus);
    runHooks('displayedLayerUpdated', { name: name, display: display });
  }



  // PLUGIN END //////////////////////////////////////////////////////////
  setup.info = plugin_info; //add the script info data to the function as a property
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  // if IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === 'function') setup();
}
// wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
