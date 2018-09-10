// ==UserScript==
// @id             iitc-plugin-gympossible@wintervorst
// @name           IITC plugin: Gympossible
// @category       Layer
// @version        0.0.1.20181009.010107
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/gympossible/gympossible.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/
// @description    [iitc-20181009.010107] Highlights level 14 cells where the next portal/stop will create a new gym
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
  plugin_info.dateTimeVersion = '20181009.010107';
  plugin_info.pluginId = 'Gympossible';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.gympossible = function() {};  
  window.plugin.gympossible.celllist = [];
  window.plugin.gympossible.possibleportallist = []; 
  window.plugin.gympossible.stoporgymcells = []; 
  window.plugin.gympossible.cellLevel = 17;  
  
  window.plugin.gympossible.update = function() {		
     if (!window.map.hasLayer(window.plugin.gympossible.occupiedPoGoCellsLayer) && !window.map.hasLayer(window.plugin.gympossible.level14CellsLayer))
    return;                    
                	
    
    if (window.map.hasLayer(window.plugin.gympossible.occupiedPoGoCellsLayer)) { 
      window.plugin.gympossible.occupiedPoGoCellsLayer.clearLayers(); 
      window.plugin.gympossible.stoporgymcells = [];
      window.plugin.gympossible.initPossiblePortalList();
      window.plugin.gympossible.cellLevel = 17;
     	window.plugin.gympossible.drawCellList(); 
    }    
    
    if (window.map.hasLayer(window.plugin.gympossible.level14CellsLayer)) {  
        window.plugin.gympossible.level14CellsLayer.clearLayers();
      window.plugin.gympossible.cellLevel = 14;
     	window.plugin.gympossible.drawCellList(); 
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
    if (window.plugin.gympossible.cellLevel == 14 && window.plugin.gympossible.stoporgymcells.length > 0 ) {
      $.each(window.plugin.gympossible.stoporgymcells, function(i, latlng) {
        if (latlng != undefined) {
        if (cellPolygon.containsLatLng(latlng)) {
         	countPerCell++;
       
        }
        }
        
      });
      
    } else {
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
    }
  
  return countPerCell;
}
  
  
  
window.plugin.gympossible.drawCell = function(cell) {  
  var portalCellCount = window.plugin.gympossible.getPortalsPerCellCount(cell);  
  if (portalCellCount > 0) {    
		window.plugin.gympossible.drawOccupiedCell(cell, portalCellCount);
  }     
}

window.plugin.gympossible.drawCellAndNeighbors = function(cell) {
  		var cellStr = cell.toString();

      if (!window.plugin.gympossible.seenCells[cellStr]) {
        // cell not visited - flag it as visited now
        window.plugin.gympossible.seenCells[cellStr] = true;

        // is it on the screen?
        var corners = cell.getCornerLatLngs();
        var cellBounds = L.latLngBounds([corners[0],corners[1]]).extend(corners[2]).extend(corners[3]);

        if (cellBounds.intersects(window.plugin.gympossible.bounds)) {
          // on screen - draw it
          window.plugin.gympossible.drawCell(cell);

          // and recurse to our neighbors
          var neighbors = cell.getNeighbors();
          for (var i=0; i<neighbors.length; i++) {
            window.plugin.gympossible.drawCellAndNeighbors(neighbors[i]);
          }
        }
    }
}

window.plugin.gympossible.seenCells = {};
window.plugin.gympossible.bounds = null;

window.plugin.gympossible.drawCellList = function() {
 		window.plugin.gympossible.bounds = map.getBounds();
		window.plugin.gympossible.seenCells = {};    

    // centre cell
    var zoom = map.getZoom();
    var maxzoom = 15;
    if (window.plugin.gympossible.cellLevel <= 14) maxzoom = 10;
    if (window.plugin.gympossible.cellLevel <= 8) maxzoom = 5;
    if (zoom >= maxzoom) {  // 5 // ;;;;
      // var cellSize = zoom>=7 ? 6 : 4;  // ;;;;vib
      var cellSize = window.plugin.gympossible.cellLevel;
      var cell = S2.S2Cell.FromLatLng ( map.getCenter(), cellSize );

      window.plugin.gympossible.drawCellAndNeighbors(cell);
    }    
}   

window.plugin.gympossible.drawOccupiedCell = function(cell, portalCellCount) {
  //TODO: move to function - then call for all cells on screen		  
    // corner points
    var corners = cell.getCornerLatLngs();
    
    var mapBounds = window.plugin.gympossible.bounds;
    
    // center point
    var center = cell.getLatLng();

    // name
    var name = portalCellCount;
    
    var color = cell.level == 6 ? 'gold' : 'orange';
        
    //{color:'black', opacity:1, fillColor:'purple', fillOpacity:0.40, weight:3, clickable:false};
      // the level 6 cells have noticible errors with non-geodesic lines - and the larger level 4 cells are worse
    // NOTE: we only draw two of the edges. as we draw all cells on screen, the other two edges will either be drawn
    // from the other cell, or be off screen so we don't care
  if (window.plugin.gympossible.cellLevel == 14) {
    var fill = false;
    if (portalCellCount == 1 || portalCellCount == 5 || portalCellCount == 19 || portalCellCount == 26) {
       fill = true;
    }
     var region = L.geodesicPolygon([corners[0],corners[1],corners[2],corners[3]], {fill: fill, color: 'pink', fillColor:'teal', opacity: 1, weight: 3, fillOpacity:0.60, clickable: false });
  } else {
    var region = L.geodesicPolygon([corners[0],corners[1],corners[2],corners[3]], {fill: true, color: 'purple', fillColor:'purple', opacity: 1, weight: 1, fillOpacity:0.30, clickable: false });
  }
        
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
    	
    
    if (window.plugin.gympossible.cellLevel == 17) {
      window.plugin.gympossible.stoporgymcells.push(center);
      window.plugin.gympossible.occupiedPoGoCellsLayer.addLayer(region);  	
     // window.plugin.gympossible.occupiedPoGoCellsLayer.addLayer(marker);   
    }
  
   if (window.plugin.gympossible.cellLevel == 19) {
      
      window.plugin.gympossible.occupiedIngressCellsLayer.addLayer(region);  	
      window.plugin.gympossible.occupiedIngressCellsLayer.addLayer(marker);   
   } 
  
   if (window.plugin.gympossible.cellLevel == 14) {
      window.plugin.gympossible.level14CellsLayer.addLayer(region);  	
      window.plugin.gympossible.level14CellsLayer.addLayer(marker);   
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
        
    window.plugin.gympossible.occupiedPoGoCellsLayer = new L.LayerGroup();            
  window.plugin.gympossible.level14CellsLayer = new L.LayerGroup();   
        
    window.addLayerGroup('Full Pokémon Go cells (L17)', window.plugin.gympossible.occupiedPoGoCellsLayer, true);
    window.addLayerGroup('L14 cells', window.plugin.gympossible.level14CellsLayer, true);
            
  	// Custom hook
    window.pluginCreateHook('displayedLayerUpdated');
  
    window.addHook('mapDataRefreshEnd', window.plugin.gympossible.update);         
    window.addHook('displayedLayerUpdated',  window.plugin.gympossible.layerUpdated);
    window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;
}  

window.plugin.gympossible.layerUpdated = function(updatedLayer) {
    if ((updatedLayer.name == 'Full Pokémon Go cells (L17)' || updatedLayer.name == 'L14 cells') && updatedLayer.display) {
     		 window.plugin.gympossible.update();
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

window.S2 = {};


      var LatLngToXYZ = function(latLng) {
        var d2r = Math.PI/180.0;

        var phi = latLng.lat*d2r;
        var theta = latLng.lng*d2r;

        var cosphi = Math.cos(phi);

        return [Math.cos(theta)*cosphi, Math.sin(theta)*cosphi, Math.sin(phi)];
      };

      var XYZToLatLng = function(xyz) {
        var r2d = 180.0/Math.PI;

        var lat = Math.atan2(xyz[2], Math.sqrt(xyz[0]*xyz[0]+xyz[1]*xyz[1]));
        var lng = Math.atan2(xyz[1], xyz[0]);

        return L.latLng(lat*r2d, lng*r2d);
      };

      var largestAbsComponent = function(xyz) {
        var temp = [Math.abs(xyz[0]), Math.abs(xyz[1]), Math.abs(xyz[2])];

        if (temp[0] > temp[1]) {
          if (temp[0] > temp[2]) {
            return 0;
          } else {
            return 2;
          }
        } else {
          if (temp[1] > temp[2]) {
            return 1;
          } else {
            return 2;
          }
        }

      };

      var faceXYZToUV = function(face,xyz) {
        var u,v;

        switch (face) {
          case 0: u =  xyz[1]/xyz[0]; v =  xyz[2]/xyz[0]; break;
          case 1: u = -xyz[0]/xyz[1]; v =  xyz[2]/xyz[1]; break;
          case 2: u = -xyz[0]/xyz[2]; v = -xyz[1]/xyz[2]; break;
          case 3: u =  xyz[2]/xyz[0]; v =  xyz[1]/xyz[0]; break;
          case 4: u =  xyz[2]/xyz[1]; v = -xyz[0]/xyz[1]; break;
          case 5: u = -xyz[1]/xyz[2]; v = -xyz[0]/xyz[2]; break;
          default: throw {error: 'Invalid face'}; break;
        }

        return [u,v];
      }




      var XYZToFaceUV = function(xyz) {
        var face = largestAbsComponent(xyz);

        if (xyz[face] < 0) {
          face += 3;
        }

        uv = faceXYZToUV (face,xyz);

        return [face, uv];
      };

      var FaceUVToXYZ = function(face,uv) {
        var u = uv[0];
        var v = uv[1];

        switch (face) {
          case 0: return [ 1, u, v];
          case 1: return [-u, 1, v];
          case 2: return [-u,-v, 1];
          case 3: return [-1,-v,-u];
          case 4: return [ v,-1,-u];
          case 5: return [ v, u,-1];
          default: throw {error: 'Invalid face'};
        }
      };


      var STToUV = function(st) {
        var singleSTtoUV = function(st) {
          if (st >= 0.5) {
            return (1/3.0) * (4*st*st - 1);
          } else {
            return (1/3.0) * (1 - (4*(1-st)*(1-st)));
          }
        };

        return [singleSTtoUV(st[0]), singleSTtoUV(st[1])];
      };



      var UVToST = function(uv) {
        var singleUVtoST = function(uv) {
          if (uv >= 0) {
            return 0.5 * Math.sqrt (1 + 3*uv);
          } else {
            return 1 - 0.5 * Math.sqrt (1 - 3*uv);
          }
        };

        return [singleUVtoST(uv[0]), singleUVtoST(uv[1])];
      };


      var STToIJ = function(st,order) {
        var maxSize = (1<<order);

        var singleSTtoIJ = function(st) {
          var ij = Math.floor(st * maxSize);
          return Math.max(0, Math.min(maxSize-1, ij));
        };

        return [singleSTtoIJ(st[0]), singleSTtoIJ(st[1])];
      };


      var IJToST = function(ij,order,offsets) {
        var maxSize = (1<<order);

        return [
          (ij[0]+offsets[0])/maxSize,
          (ij[1]+offsets[1])/maxSize
        ];
      };

      // hilbert space-filling curve
      // based on http://blog.notdot.net/2009/11/Damn-Cool-Algorithms-Spatial-indexing-with-Quadtrees-and-Hilbert-Curves
      // note: rather then calculating the final integer hilbert position, we just return the list of quads
      // this ensures no precision issues whth large orders (S3 cell IDs use up to 30), and is more
      // convenient for pulling out the individual bits as needed later
      var pointToHilbertQuadList = function(x,y,order) {
        var hilbertMap = {
          'a': [ [0,'d'], [1,'a'], [3,'b'], [2,'a'] ],
          'b': [ [2,'b'], [1,'b'], [3,'a'], [0,'c'] ],
          'c': [ [2,'c'], [3,'d'], [1,'c'], [0,'b'] ],
          'd': [ [0,'a'], [3,'c'], [1,'d'], [2,'d'] ]
        };

        var currentSquare='a';
        var positions = [];

        for (var i=order-1; i>=0; i--) {

          var mask = 1<<i;

          var quad_x = x&mask ? 1 : 0;
          var quad_y = y&mask ? 1 : 0;

          var t = hilbertMap[currentSquare][quad_x*2+quad_y];

          positions.push(t[0]);

          currentSquare = t[1];
        }

        return positions;
      };




      // S2Cell class

      S2.S2Cell = function(){};

      //static method to construct
      S2.S2Cell.FromLatLng = function(latLng,level) {

        var xyz = LatLngToXYZ(latLng);

        var faceuv = XYZToFaceUV(xyz);
        var st = UVToST(faceuv[1]);

        var ij = STToIJ(st,level);

        return S2.S2Cell.FromFaceIJ (faceuv[0], ij, level);
      };

      S2.S2Cell.FromFaceIJ = function(face,ij,level) {
        var cell = new S2.S2Cell();
        cell.face = face;
        cell.ij = ij;
        cell.level = level;

        return cell;
      };


      S2.S2Cell.prototype.toString = function() {
        return 'F'+this.face+'ij['+this.ij[0]+','+this.ij[1]+']@'+this.level;
      };

      S2.S2Cell.prototype.getLatLng = function() {
        var st = IJToST(this.ij,this.level, [0.5,0.5]);
        var uv = STToUV(st);
        var xyz = FaceUVToXYZ(this.face, uv);

        return XYZToLatLng(xyz);
      };

      S2.S2Cell.prototype.getCornerLatLngs = function() {
        var result = [];
        var offsets = [
          [ 0.0, 0.0 ],
          [ 0.0, 1.0 ],
          [ 1.0, 1.0 ],
          [ 1.0, 0.0 ]
        ];

        for (var i=0; i<4; i++) {
          var st = IJToST(this.ij, this.level, offsets[i]);
          var uv = STToUV(st);
          var xyz = FaceUVToXYZ(this.face, uv);

          result.push ( XYZToLatLng(xyz) );
        }
        return result;
      };


      S2.S2Cell.prototype.getFaceAndQuads = function() {
        var quads = pointToHilbertQuadList(this.ij[0], this.ij[1], this.level);

        return [this.face,quads];
      };

      S2.S2Cell.prototype.getNeighbors = function() {

        var fromFaceIJWrap = function(face,ij,level) {
          var maxSize = (1<<level);
          if (ij[0]>=0 && ij[1]>=0 && ij[0]<maxSize && ij[1]<maxSize) {
            // no wrapping out of bounds
            return S2.S2Cell.FromFaceIJ(face,ij,level);
          } else {
            // the new i,j are out of range.
            // with the assumption that they're only a little past the borders we can just take the points as
            // just beyond the cube face, project to XYZ, then re-create FaceUV from the XYZ vector

            var st = IJToST(ij,level,[0.5,0.5]);
            var uv = STToUV(st);
            var xyz = FaceUVToXYZ(face,uv);
            var faceuv = XYZToFaceUV(xyz);
            face = faceuv[0];
            uv = faceuv[1];
            st = UVToST(uv);
            ij = STToIJ(st,level);
            return S2.S2Cell.FromFaceIJ (face, ij, level);
          }
        };

        var face = this.face;
        var i = this.ij[0];
        var j = this.ij[1];
        var level = this.level;


        return [
          fromFaceIJWrap(face, [i-1,j], level),
          fromFaceIJWrap(face, [i,j-1], level),
          fromFaceIJWrap(face, [i+1,j], level),
          fromFaceIJWrap(face, [i,j+1], level)
        ];

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