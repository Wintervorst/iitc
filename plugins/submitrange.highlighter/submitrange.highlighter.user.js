// ==UserScript==
// @id             iitc-plugin-submitrangehighlighter@wintervorst
// @name           IITC plugin: Portal submitrange - Highlight edition
// @category       Highlighter
// @version        1.0.7.20181004.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/submitrange.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/submitrange.user.js
// @description    [iitc-20181004.013370] Shows the 'too close' radius of existing portals, in order to see where you can search for and submit new candidates
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @match	         https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
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
  plugin_info.dateTimeVersion = '20181004.013370';
  plugin_info.pluginId = 'Submitrange Highlighter';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.submitrangeHighlighter = function() {};

  window.plugin.submitrangeHighlighter.highlight = function(data) {
		var guid = data.portal.options.guid;
		var portal = data.portal;
		var bounds = map.getBounds();

	if (window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers[guid] == undefined) {
			var portalLatLng = portal.getLatLng();
      //if (bounds.contains(portalLatLng)) {
				window.plugin.submitrangeHighlighter.draw(portal, guid);
      //
	  }
	}


	window.plugin.submitrangeHighlighter.setSelected = function(selected) {
		if (selected) {
			if (!map.hasLayer(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers)) {
				map.addLayer(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers);
			}
		} else {
			if (map.hasLayer(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers)) {
				map.removeLayer(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers);
			}
		}
	}

  // Define and add the submitrange circles for a given portal
  // guid - The unique ID of the portal to be added
  window.plugin.submitrangeHighlighter.draw = function(portal, guid) {
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = {color:'black', opacity:1, fillColor:'purple', fillOpacity:0.40, weight:1, clickable:false};
    var range = 20; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the submitrange draw layer
    circle.addTo(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers);
    window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers[guid] = circle;
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

      window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers = new L.LayerGroup();
      window.addPortalHighlighter('Portal submit range', window.plugin.submitrangeHighlighter);
      addHook('mapDataRefreshEnd', window.plugin.submitrangeHighlighter.urlMarker);
      addHook('portalAdded', window.plugin.submitrangeHighlighter.portalAdded);
    	//addHook('portalRemoved', window.plugin.submitrangeHighlighter.unhighlight);
  }

  window.plugin.submitrangeHighlighter.portalAdded = function(data) {
      window.plugin.submitrangeHighlighter.highlight(data);
  }

  window.plugin.submitrangeHighlighter.getParameterByName =	function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  window.plugin.submitrangeHighlighter.urlMarker = function() {
    var pll = window.plugin.submitrangeHighlighter.getParameterByName('pll')
    if (pll == undefined) {
        var ll = window.plugin.submitrangeHighlighter.getParameterByName('ll')
        if (ll != null) {
          var coords = ll.split(',');
          var markerLatLng = L.latLng(coords[0],coords[1]);

          var distanceToClosest = window.plugin.submitrangeHighlighter.getDistanceToClosest(markerLatLng);

          createGenericMarker(markerLatLng, 'red', {
            title: 'Url location ' + distanceToClosest,
          }).addTo(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers);

          var marker = L.marker(markerLatLng, {
            icon: L.divIcon({
              className: 'plugin-submitdistance-name',
              iconAnchor: [100,5],
              iconSize: [200,10],
              html: distanceToClosest,
            })
          }).addTo(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers);
        }
    }
  }


  window.plugin.submitrangeHighlighter.getDistanceToClosest = function(markerLatLng) {
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
    	 	}).addTo(window.plugin.submitrangeHighlighter.submitrangeHighlighterLayers);
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