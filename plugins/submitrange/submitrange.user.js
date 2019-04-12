// ==UserScript==
// @id             iitc-plugin-submitrange@wintervorst
// @name           IITC plugin: Portal submitrange
// @category       Layer
// @version        1.0.11.20190412.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/submitrange.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/submitrange.user.js
// @description    [iitc-20190412.013370] Shows the 'too close' radius of existing portals, in order to see where you can search for and submit new candidates
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
  plugin_info.dateTimeVersion = '20190412.013370';
  plugin_info.pluginId = 'Submitrange';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.submitrange = function() {};   
  window.plugin.submitrange.layerlist = {};	
  
   window.plugin.submitrange.update = function() {		    
     if (!window.map.hasLayer(window.plugin.submitrange.submitrangeLayers))
     return;
      
	 if (window.map.hasLayer(window.plugin.submitrange.submitrangeLayers)) {
         window.plugin.submitrange.submitrangeLayers.clearLayers();    
	      
		 $.each(window.portals, function(i, portal) {    	      
			window.plugin.submitrange.draw(portal);
   		 });          
		 window.plugin.submitrange.urlMarker();		
      }
   }

  window.plugin.submitrange.setSelected = function(a) {        
    if (a.display) {
      var selectedLayer = window.plugin.submitrange.layerlist[a.name];      
      if (selectedLayer !== undefined) {
      	if (!window.map.hasLayer(selectedLayer)) {
        	  window.map.addLayer(selectedLayer);
      	}      
      	if (window.map.hasLayer(selectedLayer)) {
        	 window.plugin.submitrange.update();
      	}
      }      
    }
  }     
    
  // Define and add the submitrange circles for a given portal  
  window.plugin.submitrange.draw = function(portal) {           
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = {color:'black', opacity:1, fillColor:'purple', fillOpacity:0.40, weight:1, clickable:false, interactive:false};
    var range = 20; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the submitrange draw layer
    circle.addTo(window.plugin.submitrange.submitrangeLayers);    
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
        if (ll != null) {
          var coords = ll.split(',');	
          var markerLatLng = L.latLng(coords[0],coords[1]);

          var distanceToClosest = window.plugin.submitrange.getDistanceToClosest(markerLatLng);

          createGenericMarker(markerLatLng, 'pink', {
            title: 'Url location ' + distanceToClosest,          
          }).addTo(window.plugin.submitrange.submitrangeLayers);   

          var marker = L.marker(markerLatLng, {
            icon: L.divIcon({
              className: 'plugin-submitdistance-name',
              iconAnchor: [100,5],
              iconSize: [200,10],
              html: distanceToClosest,
            })
          }).addTo(window.plugin.submitrange.submitrangeLayers);
        }
    }        
  }
  
  
  window.plugin.submitrange.getDistanceToClosest = function(markerLatLng) {           
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
       			color: 'pink',
       			opacity: 0.8,
       			weight: 3,
       			clickable: false,   
			    dashArray: 10,
            html: shortestDistance       			
    	 	}).addTo(window.plugin.submitrange.submitrangeLayers);  			     
        return shortestDistance;
      }
    
      return '';
  }  

 // Initialize the plugin and display submitranges if at an appropriate zoom level
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
    
      window.plugin.submitrange.submitrangeLayers = new L.LayerGroup();  
	  window.addLayerGroup('Portal submit range', window.plugin.submitrange.submitrangeLayers, true);      
	  window.plugin.submitrange.layerlist['Portal submit range'] =  window.plugin.submitrange.submitrangeLayers;
      addHook('mapDataRefreshEnd', window.plugin.submitrange.update);    	
	  window.pluginCreateHook('displayedLayerUpdated');
	  
      window.addHook('displayedLayerUpdated',  window.plugin.submitrange.setSelected);
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
