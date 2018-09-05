// ==UserScript==
// @id             iitc-plugin-occupiedcells@wintervorst
// @name           IITC plugin: Full Cells - Ingress or Pokémon
// @category       Layer
// @version        0.0.1.20180509.010107
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/occupiedcells/occupiedcells.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/
// @description    [iitc-20180509.010107] Displays full cells, where portal or Pokéstop limit is reached, in order to see where you'd best submit new candidates
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
  plugin_info.dateTimeVersion = '20180509.010107';
  plugin_info.pluginId = 'Occupiedcells';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.occupiedcells = function() {};  
  window.plugin.occupiedcells.celllist = [];
  window.plugin.occupiedcells.possibleportallist = []; 
  window.plugin.occupiedcells.cellLevel = 17;  
  
  window.plugin.occupiedcells.update = function() {		
     if (!window.map.hasLayer(window.plugin.occupiedcells.occupiedIngressCellsLayer) &&
      !window.map.hasLayer(window.plugin.occupiedcells.occupiedPoGoCellsLayer))
    return;
    
    window.plugin.occupiedcells.occupiedIngressCellsLayer.clearLayers();
    window.plugin.occupiedcells.occupiedPoGoCellsLayer.clearLayers();          
    
    if (window.map.hasLayer(window.plugin.occupiedcells.occupiedIngressCellsLayer)) {
      window.plugin.occupiedcells.initPossiblePortalList();
      window.plugin.occupiedcells.cellLevel = 19;
     	window.plugin.occupiedcells.drawCellList(); 
    }              	
    
    if (window.map.hasLayer(window.plugin.occupiedcells.occupiedPoGoCellsLayer)) {      
      window.plugin.occupiedcells.initPossiblePortalList();
      window.plugin.occupiedcells.cellLevel = 17;
     	window.plugin.occupiedcells.drawCellList(); 
    }              	
  };  
  
  window.plugin.occupiedcells.initPossiblePortalList = function() { 
    window.plugin.occupiedcells.possibleportallist = [];
    window.plugin.occupiedcells.bounds = map.getBounds();    
    $.each(window.portals, function(i, portal) {
      var portalLatLng = portal.getLatLng();
     	if (window.plugin.occupiedcells.bounds.contains(portalLatLng)) {        
        window.plugin.occupiedcells.possibleportallist.push(portal);      
    	}
    });
  }
  
  window.plugin.occupiedcells.getPortalsPerCellCount = function(cell) { 
  var countPerCell = 0;
  var cellCorners = cell.getCornerLatLngs();
  var cellPolygon = new google.maps.Polygon({paths: cellCorners});     
  $.each(window.plugin.occupiedcells.possibleportallist, function(i, portal) {
      if (portal != undefined) {        
  	    var portalLatLng = portal.getLatLng(); 
    	  if (cellPolygon.containsLatLng(portalLatLng)) {
         	countPerCell++;
          var indexIs = window.plugin.occupiedcells.possibleportallist.indexOf(portal);            
     			window.plugin.occupiedcells.possibleportallist.splice(indexIs, 1);
        }
   	}
  }); 
  
  return countPerCell;
}
  
window.plugin.occupiedcells.drawCell = function(cell) {  
  var portalCellCount = window.plugin.occupiedcells.getPortalsPerCellCount(cell);  
  if (portalCellCount > 0) {    
		window.plugin.occupiedcells.drawOccupiedCell(cell, portalCellCount);
  }     
}

window.plugin.occupiedcells.drawCellAndNeighbors = function(cell) {
  		var cellStr = cell.toString();

      if (!window.plugin.occupiedcells.seenCells[cellStr]) {
        // cell not visited - flag it as visited now
        window.plugin.occupiedcells.seenCells[cellStr] = true;

        // is it on the screen?
        var corners = cell.getCornerLatLngs();
        var cellBounds = L.latLngBounds([corners[0],corners[1]]).extend(corners[2]).extend(corners[3]);

        if (cellBounds.intersects(window.plugin.occupiedcells.bounds)) {
          // on screen - draw it
          window.plugin.occupiedcells.drawCell(cell);

          // and recurse to our neighbors
          var neighbors = cell.getNeighbors();
          for (var i=0; i<neighbors.length; i++) {
            window.plugin.occupiedcells.drawCellAndNeighbors(neighbors[i]);
          }
        }
    }
}

window.plugin.occupiedcells.seenCells = {};
window.plugin.occupiedcells.bounds = null;

window.plugin.occupiedcells.drawCellList = function() {
 		window.plugin.occupiedcells.bounds = map.getBounds();
		window.plugin.occupiedcells.seenCells = {};    

    // centre cell
    var zoom = map.getZoom();
    var maxzoom = 16;
    if (window.plugin.occupiedcells.cellLevel <= 14) maxzoom = 10;
    if (window.plugin.occupiedcells.cellLevel <= 8) maxzoom = 5;
    if (zoom >= maxzoom) {  // 5 // ;;;;
      // var cellSize = zoom>=7 ? 6 : 4;  // ;;;;vib
      var cellSize = window.plugin.occupiedcells.cellLevel;
      var cell = S2.S2Cell.FromLatLng ( map.getCenter(), cellSize );

      window.plugin.occupiedcells.drawCellAndNeighbors(cell);
    }    
}   

window.plugin.occupiedcells.drawOccupiedCell = function(cell, portalCellCount) {
  //TODO: move to function - then call for all cells on screen		  
    // corner points
    var corners = cell.getCornerLatLngs();
    
    var mapBounds = window.plugin.occupiedcells.bounds;
    
    // center point
    var center = cell.getLatLng();

    // name
    var name = portalCellCount;
    
    var color = cell.level == 6 ? 'gold' : 'orange';
        
    //{color:'black', opacity:1, fillColor:'purple', fillOpacity:0.40, weight:3, clickable:false};
      // the level 6 cells have noticible errors with non-geodesic lines - and the larger level 4 cells are worse
    // NOTE: we only draw two of the edges. as we draw all cells on screen, the other two edges will either be drawn
    // from the other cell, or be off screen so we don't care
    var region = L.geodesicPolygon([corners[0],corners[1],corners[2],corners[3]], {fill: true, color: 'black', fillColor:'purple', opacity: 1, weight: 3, fillOpacity:0.40, clickable: false });
        
    //  var region = L.geodesicPolyline([corners[0],corners[1],corners[2]], {fill: false, color: color, opacity: 0., weight: 10, clickable: false });
    
    

    // move the label if we're at a high enough zoom level and it's off screen
    if (map.getZoom() >= 9) {
      var namebounds = map.getBounds().pad(-0.1); // pad 10% inside the screen bounds
      if (!namebounds.contains(center)) {
        // name is off-screen. pull it in so it's inside the bounds
        var newlat = Math.max(Math.min(center.lat, namebounds.getNorth()), namebounds.getSouth());
        var newlng = Math.max(Math.min(center.lng, namebounds.getEast()), namebounds.getWest());

        var newpos = L.latLng(newlat,newlng);

        // ensure the new position is still within the same cell
        var newposcell = S2.S2Cell.FromLatLng ( newpos, 6 );
        if ( newposcell.toString() == cell.toString() ) {
          center=newpos;
        }
        // else we leave the name where it was - offscreen
      }
    }
 		var marker = L.marker(center, {
      icon: L.divIcon({
        className: 'plugin-occupiedcells-name',
        iconAnchor: [100,5],
        iconSize: [200,10],
        html: name,
      })
    });
    	
    
    if (window.plugin.occupiedcells.cellLevel == 17) {
      window.plugin.occupiedcells.occupiedPoGoCellsLayer.addLayer(region);  	
      window.plugin.occupiedcells.occupiedPoGoCellsLayer.addLayer(marker);   
    }
  
   if (window.plugin.occupiedcells.cellLevel == 19) {
      window.plugin.occupiedcells.occupiedIngressCellsLayer.addLayer(region);  	
      window.plugin.occupiedcells.occupiedIngressCellsLayer.addLayer(marker);   
   }  
}
 
var setup = function() {
    
     $("<style>")
    .prop("type", "text/css")
    .html(".plugin-occupiedcells-name {\
      font-size: 14px;\
      font-weight: bold;\
      color: gold;\
      opacity: 0.7;\
      text-align: center;\
      text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000; \
      pointer-events: none;\
    }")
    .appendTo("head");
    
    
    if (window.plugin.showcells === undefined) {
       alert("'Full Cells - Ingress or Pokémon' requires 'Show Level 17 Cells'");
       return;
    } 
    
    window.plugin.occupiedcells.occupiedIngressCellsLayer = new L.LayerGroup();            
    window.plugin.occupiedcells.occupiedPoGoCellsLayer = new L.LayerGroup();            
    
    window.addLayerGroup('Full Ingress cells (L19)', window.plugin.occupiedcells.occupiedIngressCellsLayer, false);
    window.addLayerGroup('Full Pokémon Go cells (L17)', window.plugin.occupiedcells.occupiedPoGoCellsLayer, false);
            
  	// Custom hook
    window.pluginCreateHook('displayedLayerUpdated');
  
    window.addHook('mapDataRefreshEnd', window.plugin.occupiedcells.update);         
    window.addHook('displayedLayerUpdated',  window.plugin.occupiedcells.layerUpdated);
    window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;
}  

window.plugin.occupiedcells.layerUpdated = function(updatedLayer) {
    if ((updatedLayer.name == 'Full Ingress cells (L19)' || updatedLayer.name == 'Full Pokémon Go cells (L17)') && updatedLayer.display) {
     		 window.plugin.occupiedcells.update();
    }     
}

// Overload for IITC default
// Update layerGroups display status to window.overlayStatus and localStorage 'ingress.intelmap.layergroupdisplayed'
window.updateDisplayedLayerGroupModified = function(name, display) {
  overlayStatus[name] = display;
  localStorage['ingress.intelmap.layergroupdisplayed'] = JSON.stringify(overlayStatus);
  runHooks('displayedLayerUpdated', {name: name, display: display});
}
  
if (!google.maps.Polygon.prototype.getBounds) {
  google.maps.Polygon.prototype.getBounds = function(latLng) {
    var bounds = new google.maps.LatLngBounds(),
      paths = this.getPaths(),
      path,
      p, i;

    for (p = 0; p < paths.getLength(); p++) {
      path = paths.getAt(p);
      for (i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
    }

    return bounds;
  };
}
  
// Polygon containsLatLng - method to determine if a latLng is within a polygon
google.maps.Polygon.prototype.containsLatLng = function(latLng) {
  // Exclude points outside of bounds as there is no way they are in the poly

  var inPoly = false,
    bounds, lat, lng,
    numPaths, p, path, numPoints,
    i, j, vertex1, vertex2;

  // Arguments are a pair of lat, lng variables
  if (arguments.length == 2) {
    if (
      typeof arguments[0] == "number" &&
      typeof arguments[1] == "number"
    ) {
      lat = arguments[0];
      lng = arguments[1];
    }
  } else if (arguments.length == 1) {
    bounds = this.getBounds();

    if (!bounds && !bounds.contains(latLng)) {
      return false;
    }
    lat = latLng.lat;
    lng = latLng.lng;
  } else {
    console.log("Wrong number of inputs in google.maps.Polygon.prototype.contains.LatLng");
  }

  // Raycast point in polygon method

  numPaths = this.getPaths().getLength();
  for (p = 0; p < numPaths; p++) {
    path = this.getPaths().getAt(p);
    numPoints = path.getLength();
    j = numPoints - 1;

    for (i = 0; i < numPoints; i++) {
      vertex1 = path.getAt(i);
      vertex2 = path.getAt(j);

      if (
        vertex1.lng() <  lng &&
        vertex2.lng() >= lng ||
        vertex2.lng() <  lng &&
        vertex1.lng() >= lng
      ) {
        if (
          vertex1.lat() +
          (lng - vertex1.lng()) /
          (vertex2.lng() - vertex1.lng()) *
          (vertex2.lat() - vertex1.lat()) <
          lat
        ) {
          inPoly = !inPoly;
        }
      }

      j = i;
    }
  }

  return inPoly;
};
  
 
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