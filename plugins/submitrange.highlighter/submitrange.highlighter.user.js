// ==UserScript==
// @id             iitc-plugin-submitrange-highlighter@wintervorst
// @name           IITC plugin: Portal Submitrange Highlighter
// @category       Highlighter
// @version        1.0.6.20182409.010107
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange.highlighter/submitrange.highlighter.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange.highlighter/submitrange.highlighter.user.js
// @description    [iitc-20182409.010107] Shows the 'too close' radius of existing portals, in order to see where you can search for and submit new candidates
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
  plugin_info.dateTimeVersion = '20182409.010107';
  plugin_info.pluginId = 'submitrange.highlighter';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.submitrange.highlighter = function() {};   

  window.plugin.submitrange.highlighter.highlight = function(data) {
		var guid = data.portal.options.guid;
		var portal = data.portal;                            
		var bounds = map.getBounds();
    
	 if (window.plugin.submitrange.highlighter.submitrange.highlighterLayers[guid] === undefined) {
		var portalLatLng = portal.getLatLng();             
       	window.plugin.submitrange.highlighter.draw(portal, guid);          
	 }    
	}  
    
    
	window.plugin.submitrange.highlighter.setSelected = function(selected) {
		if (selected) {
			if (!map.hasLayer(window.plugin.submitrange.highlighter.submitrange.highlighterLayers)) {
				map.addLayer(window.plugin.submitrange.highlighter.submitrange.highlighterLayers);
			}
		} else {
			if (map.hasLayer(window.plugin.submitrange.highlighter.submitrange.highlighterLayers)) {
				map.removeLayer(window.plugin.submitrange.highlighter.submitrange.highlighterLayers);
			}
		}
	}   
    
  // Define and add the submitrange.highlighter circles for a given portal
  // guid - The unique ID of the portal to be added
  window.plugin.submitrange.highlighter.draw = function(portal, guid) {           
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = {color:'black', opacity:1, fillColor:'purple', fillOpacity:0.40, weight:1, clickable:false};
    var range = 20; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the submitrange.highlighter draw layer
    circle.addTo(window.plugin.submitrange.highlighter.submitrange.highlighterLayers);
    window.plugin.submitrange.highlighter.submitrange.highlighterLayers[guid] = circle;
  } 

  // Initialize the plugin and display submitrange.highlighters if at an appropriate zoom level
  var setup = function() {   
     $("<style>")
    .prop("type", "text/css")
    .html(".plugin-submitdistance-name {\
      font-size: 14px;\
      font-weight: bold;\
      color: gold;\
      opacity: 0.7;\
      text-align: center;\
      text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000; \
      pointer-events: none;\
    }")
    .appendTo("head");
    
      window.plugin.submitrange.highlighter.submitrange.highlighterLayers = new L.LayerGroup();  	              
      window.addPortalHighlighter('Portal submit range', window.plugin.submitrange.highlighter);	
      addHook('mapDataRefreshEnd', window.plugin.submitrange.highlighter.urlMarker);        	
      addHook('portalAdded', window.plugin.submitrange.highlighter.portalAdded);        	
    	//addHook('portalRemoved', window.plugin.submitrange.highlighter.unhighlight);        	
  }
    
  window.plugin.submitrange.highlighter.portalAdded = function(data) {  
    //ndow.plugin.submitrange.highlighter.highlight(data);  	
  }
  
  window.plugin.submitrange.highlighter.getParameterByName =	function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  
  window.plugin.submitrange.highlighter.urlMarker = function() {  
    var pll = window.plugin.submitrange.highlighter.getParameterByName('pll')
    if (pll == undefined) {				
        var ll = window.plugin.submitrange.highlighter.getParameterByName('ll')
        if (ll != null) {
          var coords = ll.split(',');	
          var markerLatLng = L.latLng(coords[0],coords[1]);

          var distanceToClosest = window.plugin.submitrange.highlighter.getDistanceToClosest(markerLatLng);

          createGenericMarker(markerLatLng, 'red', {
            title: 'Url location ' + distanceToClosest,          
          }).addTo(window.plugin.submitrange.highlighter.submitrange.highlighterLayers);   

          var marker = L.marker(markerLatLng, {
            icon: L.divIcon({
              className: 'plugin-submitdistance-name',
              iconAnchor: [100,5],
              iconSize: [200,10],
              html: distanceToClosest,
            })
          }).addTo(window.plugin.submitrange.highlighter.submitrange.highlighterLayers);
        }
    }        
  }
  
  
  window.plugin.submitrange.highlighter.getDistanceToClosest = function(markerLatLng) {           
      var bounds = map.getBounds();
    	var closestPortal;
    	var shortestDistance = -1;
    	$.each(window.portals, function(i, portal) {
      	var portalLatLng = portal.getLatLng();
        
     		if (bounds.contains(portalLatLng)) {      
    			var distance = markerLatLng.distanceTo(portalLatLng); 
				if (shortestDistance == -1) {
					shortestDistance = distance;
					closestPortal = portalLatLng;
				}
          
				if (distance != 0 && distance < shortestDistance) {
					shortestDistance = distance;
					closestPortal = portalLatLng;
				}
			}
    	});    
    
    	if (shortestDistance > -1 && closestPortal != undefined) {
					var poly = L.geodesicPolyline([markerLatLng,closestPortal] , {
       			color: 'red',
       			opacity: 0.8,
       			weight: 5,
       			clickable: false,   
            html: shortestDistance       			
    	 	}).addTo(window.plugin.submitrange.highlighter.submitrange.highlighterLayers);  			     
        return shortestDistance;
      }
    
      return '';
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