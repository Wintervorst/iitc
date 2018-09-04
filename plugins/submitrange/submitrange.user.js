// ==UserScript==
// @id             iitc-plugin-submitrange@wintervorst
// @name           IITC plugin: Portal submitrange
// @category       Highlighter
// @version        1.0.0.20180409.010107
// @author         Wintervorst
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/submitrange.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/
// @description    [iitc-20180409.010107] Shows the 'too close' radius of existing portals, in order to see where you can search for and submit new candidates
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
  plugin_info.dateTimeVersion = '20180409.010107';
  plugin_info.pluginId = 'Submitrange';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.submitrange = function() {};  

  window.plugin.submitrange.highlight = function(data) {
		var guid = data.portal.options.guid;
		var portal = data.portal;                            
		var bounds = map.getBounds();
    
		if (window.plugin.submitrange.submitrangeLayers[guid] == undefined) {
			var portalLatLng = portal.getLatLng();               
			window.plugin.submitrange.draw(portal, guid);    	
		}    
	}  
    
	window.plugin.submitrange.setSelected = function(selected) {
		if (selected) {
			if (!map.hasLayer(window.plugin.submitrange.submitrangeLayers)) {
				map.addLayer(window.plugin.submitrange.submitrangeLayers);
			}
		} else {
			if (map.hasLayer(window.plugin.submitrange.submitrangeLayers)) {
				map.removeLayer(window.plugin.submitrange.submitrangeLayers);
			}
		}
	}   
    
  // Define and add the submitrange circles for a given portal
  // guid - The unique ID of the portal to be added
  window.plugin.submitrange.draw = function(portal, guid) {           
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = {color:'black', opacity:1, fillColor:'purple', fillOpacity:0.40, weight:3, clickable:false};
    var range = 20; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the submitrange draw layer
    circle.addTo(window.plugin.submitrange.submitrangeLayers);
    window.plugin.submitrange.submitrangeLayers[guid] = circle;
  } 

  // Initialize the plugin and display submitranges if at an appropriate zoom level
  var setup = function() {    
      window.plugin.submitrange.submitrangeLayers = new L.LayerGroup();  	              
      window.addPortalHighlighter('Portal submit range', window.plugin.submitrange);	
      addHook('mapDataRefreshEnd', window.plugin.submitrange.urlMarker);
  }

  window.plugin.submitrange.getParameterByName =	function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  window.plugin.submitrange.urlMarker = function() {  
    var pll = window.plugin.submitrange.getParameterByName('pll')
    if (pll == undefined) {				
        var ll = window.plugin.submitrange.getParameterByName('ll')
        var coords = ll.split(',');			
        createGenericMarker(L.latLng(coords[0],coords[1]), 'red', {
          title: 'Url location'
        }).addTo(window.plugin.submitrange.submitrangeLayers);     
    }        
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