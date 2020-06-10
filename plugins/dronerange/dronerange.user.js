// ==UserScript==
// @id             iitc-plugin-dronerange@wintervorst
// @name           IITC plugin: Drone range
// @category       Layer
// @version        0.0.2.20200610.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/dronerange/dronerange.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/dronerange/dronerange.user.js
// @description    [iitc-20200610.013370] Draws the action radius for a drone per portal
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
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
  plugin_info.buildName = 'iitc';
  plugin_info.dateTimeVersion = '20200610.013370';
  plugin_info.pluginId = 'Dronerange';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.dronerange = function() {};
  window.plugin.dronerange.layerlist = {};

   window.plugin.dronerange.update = function() {
     if (!window.map.hasLayer(window.plugin.dronerange.dronerangeLayers))
     return;

	 if (window.map.hasLayer(window.plugin.dronerange.dronerangeLayers)) {
         window.plugin.dronerange.dronerangeLayers.clearLayers();

		 $.each(window.portals, function(i, portal) {
			window.plugin.dronerange.draw(portal);
   		 });
      }
   }

  window.plugin.dronerange.setSelected = function(a) {
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
  window.plugin.dronerange.draw = function(portal) {
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = {color:'black', opacity:0.5, fillColor:'grey', fillOpacity:0.05, weight:1, clickable:false, interactive:false};
    var range = 300; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the dronerange draw layer
    circle.addTo(window.plugin.dronerange.dronerangeLayers);
  }

 // Initialize the plugin and display droneranges if at an appropriate zoom level
  var setup = function() {

      window.plugin.dronerange.dronerangeLayers = new L.LayerGroup();
	  window.addLayerGroup('Drone range', window.plugin.dronerange.dronerangeLayers, true);
	  window.plugin.dronerange.layerlist['Drone range'] =  window.plugin.dronerange.dronerangeLayers;
      addHook('mapDataRefreshEnd', window.plugin.dronerange.update);
	  window.pluginCreateHook('displayedLayerUpdated');

      window.addHook('displayedLayerUpdated',  window.plugin.dronerange.setSelected);
	  window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;
  }

  // Overload for IITC default in order to catch the manual select/deselect event and handle it properly
// Update layerGroups display status to window.overlayStatus and localStorage 'ingress.intelmap.layergroupdisplayed'
 window.updateDisplayedLayerGroupModified = function(name, display) {
  overlayStatus[name] = display;
  localStorage['ingress.intelmap.layergroupdisplayed'] = JSON.stringify(overlayStatus);
  runHooks('displayedLayerUpdated', {name: name, display: display});
}



// PLUGIN END //////////////////////////////////////////////////////////
setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
}
// wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
