// ==UserScript==
// @id             iitc-plugin-gympossible@wintervorst
// @name           IITC plugin: L14 Cells - Gympossible
// @category       Layer
// @version        0.0.7.20190311.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/gympossible/gympossible.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/gympossible/gympossible.user.js
// @description    [iitc-20190311.013370] Highlights level 14 cells where the next stop wil generate a gym in that cell in order to see where you would best submit new portal candidates
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
  plugin_info.dateTimeVersion = '20190311.013370';
  plugin_info.pluginId = 'gympossible';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.gympossible = function() {};      
  window.plugin.gympossible.cellLevel = 14;  
  window.plugin.gympossible.stopOrGymCellLevel = 17;
  window.plugin.gympossible.minZoomLevel = 13;
  window.plugin.gympossible.minThresholdZoomLevel = 15;
  window.plugin.gympossible.layerlist = {};	
  window.plugin.gympossible.possibleportallist = []; 
  window.plugin.gympossible.stoporgymcells = [];
  window.plugin.gympossible.cellOptionsOccupied = {fill: true, color: 'teal', fillColor:'teal', opacity: 1, weight: 3, fillOpacity:0.30, clickable: false, interactive: false };  
  window.plugin.gympossible.cellOptionsEmpty = {fill: false, color: 'orange', opacity: 0.8, weight: 3, clickable: false, interactive: false };  
  

    window.plugin.gympossible.setDisabledState = function() {
       var labelFull = $(".leaflet-control-layers-overlays label span:contains('L14 - Gym possible cells')").parent();
       if (map.getZoom() >= window.plugin.gympossible.minThresholdZoomLevel) {
           labelFull.removeClass('disabled').attr('title', '');
       } else {
           window.plugin.gympossible.occupiedCellsLayer.clearLayers();
           labelFull.addClass('disabled').attr('title', 'Zoom in to show those.');
       }

       var label = $(".leaflet-control-layers-overlays label span:contains('L14 - Pokémon cells')").parent();
       if (map.getZoom() >= window.plugin.gympossible.minZoomLevel) {
           label.removeClass('disabled').attr('title', '');
       } else {
           window.plugin.gympossible.cellsLayer.clearLayers();
           label.addClass('disabled').attr('title', 'Zoom in to show those.');
       }
    }

  window.plugin.gympossible.update = function() {		    
     if (!window.map.hasLayer(window.plugin.gympossible.cellsLayer) && !window.map.hasLayer(window.plugin.gympossible.occupiedCellsLayer))
     return;
                          
    var initialized = false;
    if (window.map.hasLayer(window.plugin.gympossible.cellsLayer)) {
        initialized = true;
      
        window.plugin.gympossible.cellsLayer.clearLayers();
        if (map.getZoom() >= window.plugin.gympossible.minZoomLevel) {
            window.plugin.gympossible.initPossiblePortalList();
            window.plugin.gympossible.stoporgymcells = [];
            window.plugin.s2celldrawer.drawCellList(window.plugin.gympossible.cellsLayer, window.plugin.gympossible.stopOrGymCellLevel, window.plugin.gympossible.cellOptionsEmpty, window.plugin.gympossible.getPortalsPerCellCount, "plugin-gympossible-name");
            window.plugin.s2celldrawer.drawCellList(window.plugin.gympossible.cellsLayer, window.plugin.gympossible.cellLevel, window.plugin.gympossible.cellOptionsEmpty, window.plugin.gympossible.getStopsPerCellCountAlways, "plugin-gympossible-name");
        }
    }              	       
    
    if (window.map.hasLayer(window.plugin.gympossible.occupiedCellsLayer)) {
	  window.plugin.gympossible.occupiedCellsLayer.clearLayers();
      if (!initialized) {
      	window.plugin.gympossible.initPossiblePortalList();
        window.plugin.gympossible.stoporgymcells = [];
      	window.plugin.s2celldrawer.drawCellList(window.plugin.gympossible.occupiedCellsLayer, window.plugin.gympossible.stopOrGymCellLevel, window.plugin.gympossible.cellOptionsOccupied, window.plugin.gympossible.getPortalsPerCellCount, "plugin-gympossible-name");      
      }
       
       if (map.getZoom() >= window.plugin.gympossible.minThresholdZoomLevel) {
           window.plugin.s2celldrawer.drawCellList(window.plugin.gympossible.occupiedCellsLayer, window.plugin.gympossible.cellLevel, window.plugin.gympossible.cellOptionsOccupied, window.plugin.gympossible.getStopsPerCellHighlighted, "plugin-gympossible-name");           
       }
    }              	       
  };            
  
  window.plugin.gympossible.initPossiblePortalList = function() { 
    window.plugin.gympossible.possibleportallist = [];
    window.plugin.gympossible.bounds = map.getBounds();    
    $.each(window.portals, function(i, portal) {
      var portalLatLng = portal.getLatLng();
     	if (window.plugin.gympossible.bounds.contains(portalLatLng)) {        
        window.plugin.gympossible.possibleportallist.push(portal);      
    	}
    });
  }
  
  window.plugin.gympossible.getPortalsPerCellCount = function(cell) {
  	var countPerCell = 0;
  	var cellCorners = cell.getCornerLatLngs();
  	var cellPolygon = new google.maps.Polygon({paths: cellCorners}); 
    
  	$.each(window.plugin.gympossible.possibleportallist, function(i, portal) {
    	  if (portal != undefined) {        
  	  	  var portalLatLng = portal.getLatLng(); 
    	  	if (cellPolygon.containsLatLng(portalLatLng)) {
         		countPerCell++;
          	var indexIs = window.plugin.gympossible.possibleportallist.indexOf(portal);            
     				window.plugin.gympossible.possibleportallist.splice(indexIs, 1);
        	}
   			}
  	}); 
    
    var result = {};
    result.Show = false;    
    if (countPerCell > 0) {
    	 var center = cell.getLatLng();
       window.plugin.gympossible.stoporgymcells.push(center);
    }       
  	
    return result;
  }     

   window.plugin.gympossible.getStopsPerCellHighlighted = function(cell) {
  	var countPerCell = window.plugin.gympossible.getStopsPerCellCount(cell);
    if (countPerCell == 1 || countPerCell == 5 || countPerCell == 19) {
      return {Show:true, Value:countPerCell};
    }
    return {Show:false, Value:countPerCell};
  }

  
   window.plugin.gympossible.getStopsPerCellCountAlways = function(cell) {     
  	  var countPerCell = window.plugin.gympossible.getStopsPerCellCount(cell);       	  	 
      return {Show:true, Value:countPerCell}
  }
  
  window.plugin.gympossible.getStopsPerCellCount = function(cell) {      
  	var countPerCell = 0;
  	var cellCorners = cell.getCornerLatLngs();
  	var cellPolygon = new google.maps.Polygon({paths: cellCorners}); 
    
    if (window.plugin.gympossible.stoporgymcells.length > 0) {
  	$.each(window.plugin.gympossible.stoporgymcells, function(i, latlng) {
        if (latlng != undefined) {
        	if (cellPolygon.containsLatLng(latlng)) {
         		 countPerCell++;       
        	}
        }        
    });
    }

    return countPerCell;       	
  }
  
  window.plugin.gympossible.setSelected = function(a) {        
    if (a.display) {
      var selectedLayer = window.plugin.gympossible.layerlist[a.name];      
      if (selectedLayer !== undefined) {
      	if (!window.map.hasLayer(selectedLayer)) {
        	  window.map.addLayer(selectedLayer);
      	}      
      	if (window.map.hasLayer(selectedLayer)) {
        	 window.plugin.gympossible.update();
      	}
      }      
    }
  }     

 
var setup = function() {   
  	if (window.plugin.s2celldrawer === undefined) {
       alert('S2 Celldrawer plugin is required for: L14 Cells - Gympossible');
       return;
    }
  
     $("<style>")
    .prop("type", "text/css")
    .html(".plugin-gympossible-name {\
      font-size: 14px;\
      font-weight: bold;\
      color: gold;\
      opacity: 0.7;\
      text-align: center;\
      text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000; \
      pointer-events: none;\
    }")
    .appendTo("head");         
    
    window.plugin.gympossible.cellsLayer = new L.LayerGroup();      	      
    window.plugin.gympossible.occupiedCellsLayer = new L.LayerGroup();      	
    
    window.addLayerGroup('L14 - Pokémon cells', window.plugin.gympossible.cellsLayer, true);                 	
    window.plugin.gympossible.layerlist['L14 - Pokémon cells'] =  window.plugin.gympossible.cellsLayer;  
    window.addLayerGroup('L14 - Gym possible cells', window.plugin.gympossible.occupiedCellsLayer, true);                 	
    window.plugin.gympossible.layerlist['L14 - Gym possible cells'] =  window.plugin.gympossible.occupiedCellsLayer;
    window.addHook('mapDataRefreshEnd', window.plugin.gympossible.update);    
  
    window.pluginCreateHook('displayedLayerUpdated');
    window.addHook('displayedLayerUpdated',  window.plugin.gympossible.setSelected);

    map.on('zoomend', function() { window.plugin.gympossible.setDisabledState(); });
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