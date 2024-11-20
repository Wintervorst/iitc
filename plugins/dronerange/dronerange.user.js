// ==UserScript==
// @id             iitc-plugin-dronerange@wintervorst
// @name           IITC plugin: Drone range
// @category       Layer
// @version        0.0.9.20241120.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/dronerange/dronerange.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/dronerange/dronerange.user.js
// @description    [iitc-20241120.013370] Draws the action radius for a drone per portal
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @match          https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
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
  plugin_info.dateTimeVersion = '20200614.013370';
  plugin_info.pluginId = 'Dronerange';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.dronerange = function () {
  };


  window.plugin.dronerange.includeScripts = function () {

    window.plugin.dronerange.initializeS2();
  }

  window.plugin.dronerange.layerlist = {};
  window.plugin.dronerange.currentportal;
  window.plugin.dronerange.cellLevel = 16;
  window.plugin.dronerange.circleradius = 500;
  window.plugin.dronerange.cellOptions = { fill: true, color: 'teal', fillColor: 'teal', opacity: 1, weight: 3, fillOpacity: 0.10, clickable: false, interactive: false };

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
  window.plugin.dronerange.drawCells = function (portalLatLng, cellSize, cellOptions, layer, circle) {
    var cell = S2.S2Cell.FromLatLng(portalLatLng, window.plugin.dronerange.cellLevel);
    window.plugin.dronerange.seenCells = {};
    window.plugin.dronerange.celllayers = [];
    window.plugin.dronerange.drawCellAndNeighbors(layer, cell, cellSize, cellOptions, portalLatLng, circle);
    window.plugin.dronerange.highlightPortalList();
  }

  window.plugin.dronerange.celllayers = [];

  window.plugin.dronerange.drawCellAndNeighbors = function (layer, cell, cellSize, cellOptions, center, circle) {
    var cellStr = cell.toString();
    var bounds = map.getBounds();

    if (!window.plugin.dronerange.seenCells[cellStr]) {
      // cell not visited - flag it as visited now
      window.plugin.dronerange.seenCells[cellStr] = true;
      // is it on the screen?
      var corners = cell.getCornerLatLngs();
      var cellBounds = L.latLngBounds([corners[0], corners[1]]).extend(corners[2]).extend(corners[3]);
      var distanceArray = [];
      // Only draw filled cells when they are completely on screen because we must likely calculate something in it

      // on screen - draw it

      var distance_one = center.distanceTo(corners[0]);
      distanceArray.push({ d: distance_one, latlng: corners[0] });
      var distance_two = center.distanceTo(corners[1]);
      distanceArray.push({ d: distance_two, latlng: corners[1] });

      var distance_three = center.distanceTo(corners[2]);
      distanceArray.push({ d: distance_three, latlng: corners[2] });
      var distance_four = center.distanceTo(corners[3]);
      distanceArray.push({ d: distance_four, latlng: corners[3] });

      var radius = window.plugin.dronerange.circleradius;
      var sorted = distanceArray.sort((a, b) => (a.d > b.d) ? 1 : -1);
      if (Math.ceil(sorted[0].d) < window.plugin.dronerange.circleradius || window.plugin.dronerange.bounds.contains(cellBounds)) {
        window.plugin.dronerange.celllayers.push(cell);

        cellOptions.opacity = 0.5;
        window.plugin.dronerange.drawCell(layer, cell, cellSize, cellOptions);

        // and recurse to our neighbors
        var neighbors = cell.getNeighbors();
        for (var i = 0; i < neighbors.length; i++) {
          window.plugin.dronerange.drawCellAndNeighbors(layer, neighbors[i], cellSize, cellOptions, center, circle);
        }

      }

    }
  }

 window.plugin.dronerange.highlightPortalList = function() {
     console.log(window.plugin.dronerange.currentportal);
     console.log(window.plugin.dronerange.celllayers);
     if (window.plugin.dronerange.celllayers.length > 0) {
        window.plugin.dronerange.possibleportallist = window.portals;
         for (var i = 0;i < window.plugin.dronerange.celllayers.length; i++) {
             window.plugin.dronerange.highlightportalsincell(window.plugin.dronerange.celllayers[i]);
         }
     }
 }

  window.plugin.dronerange.possibleportallist = [];

  window.plugin.dronerange.highlightportalsincell = function(cell) {
    var cellCorners = cell.getCornerLatLngs();
  	var cellPolygon = new google.maps.Polygon({paths: cellCorners});
  	$.each(window.plugin.dronerange.possibleportallist, function(i, portal) {
    	  if (portal != undefined) {
              var portalLatLng = portal.getLatLng();

                  if (cellPolygon.containsLatLng(portalLatLng)) {
                      window.plugin.dronerange.highlightPortal(portalLatLng, i);
//                       var indexIs = window.plugin.dronerange.possibleportallist.indexOf(portal);
//                       window.plugin.dronerange.possibleportallist.splice(indexIs, 1);
                  }

          }
  	});
  }

  window.plugin.dronerange.highlightPortal = function(latlng, guid) {
    var circleOptions = { color: '#983091', opacity: 1, weight: 4, fillColor:'#F5B338', fillOpacity: 1, clickable: false, interactive: false };
      if (guid === window.plugin.dronerange.currentportal) {
         circleOptions.fillColor = 'F8F8F8';
          circleOptions.color = 'teal';
      }
    var range = 10;

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the dronerange draw layer
    circle.addTo(window.plugin.dronerange.dronerangeFlightplanLayers);
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
    var range = window.plugin.dronerange.circleradius / 2;

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
        window.plugin.dronerange.currentportal = portal.selectedPortalGuid;
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
    circle.addTo(window.plugin.dronerange.dronerangeFlightplanLayers);
    window.plugin.dronerange.flightplanportallayers[portal.options.guid] = circle;
    //window.plugin.dronerange.addflightpoint(portal);

    window.plugin.dronerange.bounds = circle.getBounds();
    window.plugin.dronerange.drawCells(latlng, window.plugin.dronerange.cellLevel, window.plugin.dronerange.cellOptions, window.plugin.dronerange.dronerangeFlightplanLayers, circle)
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

  // Initialize the plugin and display droneranges
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

      window.addHook('mapDataRefreshEnd', window.plugin.dronerange.highlightPortalList);
  }

  // Overload for IITC default in order to catch the manual select/deselect event and handle it properly
  // Update layerGroups display status to window.overlayStatus and localStorage 'ingress.intelmap.layergroupdisplayed'
  window.updateDisplayedLayerGroupModified = function (name, display) {
    overlayStatus[name] = display;
    localStorage['ingress.intelmap.layergroupdisplayed'] = JSON.stringify(overlayStatus);
    runHooks('displayedLayerUpdated', { name: name, display: display });
  }

  window.plugin.dronerange.initializeS2 = function () {
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
      if (google.maps.Polygon.prototype.containsLatLng === undefined) {
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

      }

    if (window.plugin.s2celldrawer === undefined) {
      window.S2 = {};


      var LatLngToXYZ = function (latLng) {
        var d2r = Math.PI / 180.0;

        var phi = latLng.lat * d2r;
        var theta = latLng.lng * d2r;

        var cosphi = Math.cos(phi);

        return [Math.cos(theta) * cosphi, Math.sin(theta) * cosphi, Math.sin(phi)];
      };

      var XYZToLatLng = function (xyz) {
        var r2d = 180.0 / Math.PI;

        var lat = Math.atan2(xyz[2], Math.sqrt(xyz[0] * xyz[0] + xyz[1] * xyz[1]));
        var lng = Math.atan2(xyz[1], xyz[0]);

        return L.latLng(lat * r2d, lng * r2d);
      };

      var largestAbsComponent = function (xyz) {
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

      var faceXYZToUV = function (face, xyz) {
        var u, v;

        switch (face) {
          case 0: u = xyz[1] / xyz[0]; v = xyz[2] / xyz[0]; break;
          case 1: u = -xyz[0] / xyz[1]; v = xyz[2] / xyz[1]; break;
          case 2: u = -xyz[0] / xyz[2]; v = -xyz[1] / xyz[2]; break;
          case 3: u = xyz[2] / xyz[0]; v = xyz[1] / xyz[0]; break;
          case 4: u = xyz[2] / xyz[1]; v = -xyz[0] / xyz[1]; break;
          case 5: u = -xyz[1] / xyz[2]; v = -xyz[0] / xyz[2]; break;
          default: throw { error: 'Invalid face' }; break;
        }

        return [u, v];
      }




      var XYZToFaceUV = function (xyz) {
        var face = largestAbsComponent(xyz);

        if (xyz[face] < 0) {
          face += 3;
        }

        uv = faceXYZToUV(face, xyz);

        return [face, uv];
      };

      var FaceUVToXYZ = function (face, uv) {
        var u = uv[0];
        var v = uv[1];

        switch (face) {
          case 0: return [1, u, v];
          case 1: return [-u, 1, v];
          case 2: return [-u, -v, 1];
          case 3: return [-1, -v, -u];
          case 4: return [v, -1, -u];
          case 5: return [v, u, -1];
          default: throw { error: 'Invalid face' };
        }
      };


      var STToUV = function (st) {
        var singleSTtoUV = function (st) {
          if (st >= 0.5) {
            return (1 / 3.0) * (4 * st * st - 1);
          } else {
            return (1 / 3.0) * (1 - (4 * (1 - st) * (1 - st)));
          }
        };

        return [singleSTtoUV(st[0]), singleSTtoUV(st[1])];
      };



      var UVToST = function (uv) {
        var singleUVtoST = function (uv) {
          if (uv >= 0) {
            return 0.5 * Math.sqrt(1 + 3 * uv);
          } else {
            return 1 - 0.5 * Math.sqrt(1 - 3 * uv);
          }
        };

        return [singleUVtoST(uv[0]), singleUVtoST(uv[1])];
      };


      var STToIJ = function (st, order) {
        var maxSize = (1 << order);

        var singleSTtoIJ = function (st) {
          var ij = Math.floor(st * maxSize);
          return Math.max(0, Math.min(maxSize - 1, ij));
        };

        return [singleSTtoIJ(st[0]), singleSTtoIJ(st[1])];
      };


      var IJToST = function (ij, order, offsets) {
        var maxSize = (1 << order);

        return [
          (ij[0] + offsets[0]) / maxSize,
          (ij[1] + offsets[1]) / maxSize
        ];
      };

      // hilbert space-filling curve
      // based on http://blog.notdot.net/2009/11/Damn-Cool-Algorithms-Spatial-indexing-with-Quadtrees-and-Hilbert-Curves
      // note: rather then calculating the final integer hilbert position, we just return the list of quads
      // this ensures no precision issues whth large orders (S3 cell IDs use up to 30), and is more
      // convenient for pulling out the individual bits as needed later
      var pointToHilbertQuadList = function (x, y, order) {
        var hilbertMap = {
          'a': [[0, 'd'], [1, 'a'], [3, 'b'], [2, 'a']],
          'b': [[2, 'b'], [1, 'b'], [3, 'a'], [0, 'c']],
          'c': [[2, 'c'], [3, 'd'], [1, 'c'], [0, 'b']],
          'd': [[0, 'a'], [3, 'c'], [1, 'd'], [2, 'd']]
        };

        var currentSquare = 'a';
        var positions = [];

        for (var i = order - 1; i >= 0; i--) {

          var mask = 1 << i;

          var quad_x = x & mask ? 1 : 0;
          var quad_y = y & mask ? 1 : 0;

          var t = hilbertMap[currentSquare][quad_x * 2 + quad_y];

          positions.push(t[0]);

          currentSquare = t[1];
        }

        return positions;
      };




      // S2Cell class

      S2.S2Cell = function () { };

      //static method to construct
      S2.S2Cell.FromLatLng = function (latLng, level) {

        var xyz = LatLngToXYZ(latLng);

        var faceuv = XYZToFaceUV(xyz);
        var st = UVToST(faceuv[1]);

        var ij = STToIJ(st, level);

        return S2.S2Cell.FromFaceIJ(faceuv[0], ij, level);
      };

      S2.S2Cell.FromFaceIJ = function (face, ij, level) {
        var cell = new S2.S2Cell();
        cell.face = face;
        cell.ij = ij;
        cell.level = level;

        return cell;
      };


      S2.S2Cell.prototype.toString = function () {
        return 'F' + this.face + 'ij[' + this.ij[0] + ',' + this.ij[1] + ']@' + this.level;
      };

      S2.S2Cell.prototype.getLatLng = function () {
        var st = IJToST(this.ij, this.level, [0.5, 0.5]);
        var uv = STToUV(st);
        var xyz = FaceUVToXYZ(this.face, uv);

        return XYZToLatLng(xyz);
      };

      S2.S2Cell.prototype.getCornerLatLngs = function () {
        var result = [];
        var offsets = [
          [0.0, 0.0],
          [0.0, 1.0],
          [1.0, 1.0],
          [1.0, 0.0]
        ];

        for (var i = 0; i < 4; i++) {
          var st = IJToST(this.ij, this.level, offsets[i]);
          var uv = STToUV(st);
          var xyz = FaceUVToXYZ(this.face, uv);

          result.push(XYZToLatLng(xyz));
        }
        return result;
      };


      S2.S2Cell.prototype.getFaceAndQuads = function () {
        var quads = pointToHilbertQuadList(this.ij[0], this.ij[1], this.level);

        return [this.face, quads];
      };

      S2.S2Cell.prototype.getNeighbors = function () {

        var fromFaceIJWrap = function (face, ij, level) {
          var maxSize = (1 << level);
          if (ij[0] >= 0 && ij[1] >= 0 && ij[0] < maxSize && ij[1] < maxSize) {
            // no wrapping out of bounds
            return S2.S2Cell.FromFaceIJ(face, ij, level);
          } else {
            // the new i,j are out of range.
            // with the assumption that they're only a little past the borders we can just take the points as
            // just beyond the cube face, project to XYZ, then re-create FaceUV from the XYZ vector

            var st = IJToST(ij, level, [0.5, 0.5]);
            var uv = STToUV(st);
            var xyz = FaceUVToXYZ(face, uv);
            var faceuv = XYZToFaceUV(xyz);
            face = faceuv[0];
            uv = faceuv[1];
            st = UVToST(uv);
            ij = STToIJ(st, level);
            return S2.S2Cell.FromFaceIJ(face, ij, level);
          }
        };

        var face = this.face;
        var i = this.ij[0];
        var j = this.ij[1];
        var level = this.level;


        return [
          fromFaceIJWrap(face, [i - 1, j], level),
          fromFaceIJWrap(face, [i, j - 1], level),
          fromFaceIJWrap(face, [i + 1, j], level),
          fromFaceIJWrap(face, [i, j + 1], level)
        ];

      };
    }
  }

  window.plugin.dronerange.includeScripts();

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
