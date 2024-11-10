// ==UserScript==
// @id             iitc-plugin-streetview@wintervorst
// @name           IITC plugin: Streetview
// @category       Layer
// @version        0.0.1.20190204.010307
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/streetview/streetview.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/streetview/streetview.user.js
// @description    [iitc-20190201.010307] Draws streetview over intel map including visible portals. Movement is mirrored on Intel map
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
if(typeof window.plugin !== 'function') window.plugin = function() {};

	//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
	//(leaving them in place might break the 'About IITC' page or break update checks)
  plugin_info.buildName = 'iitc';
  plugin_info.dateTimeVersion = '20190204.010307';
  plugin_info.pluginId = 'Streetview';
	// PLUGIN START ///////////////////////////////////////////////////////
	// use own namespace for plugin
	window.plugin.streetview = function() {};

    window.plugin.streetview.panorama = '';
    window.plugin.streetview.currentposition = '';
    window.plugin.streetview.selectedPortalGuid = '';
    window.plugin.streetview.markerList = [];
    window.plugin.streetview.streetviewmarker = '';

  window.plugin.streetview.initMap = function() {
      var center = map.getCenter();
      var dashBoard = document.getElementById('dashboard');
      var mapcontainer = document.getElementById('map');

      var div = document.createElement('div');
      div.setAttribute("id","streetview");
      div.setAttribute("style","width:25%;height:50%; position:absolute; left:60%;top:25%;z-index: 99999999999;");
      dashBoard.insertBefore(div, mapcontainer);

      window.plugin.streetview.panorama = new google.maps.StreetViewPanorama(
             document.getElementById('streetview'), {
               position: center,
               pov: {
                 heading:60,
                 pitch: 10
               }
       });

      window.plugin.streetview.panorama.addListener('position_changed', window.plugin.streetview.updateMapPosition);
    }

   window.plugin.streetview.updateMapPosition = function() {
       if (window.plugin.streetview.panorama.location !== undefined) {
           var lat = window.plugin.streetview.panorama.location.latLng.lat();
           console.log(lat);
           var lng = window.plugin.streetview.panorama.location.latLng.lng();
           console.log(lng);
           var newCenter = new L.LatLng(lat, lng);
           console.log(newCenter);
           setTimeout(function() {
             //  map.panTo(newCenter);
               map.setView(newCenter);
               if (window.plugin.streetview.streetviewmarker === '') {
                   window.plugin.streetview.streetviewLayers = new L.LayerGroup();
                   window.plugin.streetview.streetviewLayers.addTo(map);
                   window.plugin.streetview.streetviewmarker = createGenericMarker(newCenter, 'pink', {
                       title: 'Current streetview location'
                   }).addTo(window.plugin.streetview.streetviewLayers);
               } else {
                  window.plugin.streetview.streetviewmarker.setLatLng(newCenter);
               }

           }, 100);
       }

  }

  window.plugin.streetview.setPosition = function(portal) {
      if (window.plugin.streetview.selectedPortalGuid !== portal.selectedPortalGuid) {
          window.plugin.streetview.selectedPortalGuid = portal.selectedPortalGuid;
          var selectedPortal = window.portals[portal.selectedPortalGuid];
          if (selectedPortal !== undefined) {
              // try set the position
              window.plugin.streetview.panorama.setPosition(selectedPortal.getLatLng());

              setTimeout(function() {
if (window.plugin.streetview.panorama.location !== undefined) {
                  var streetViewLocation = new L.LatLng(parseFloat(window.plugin.streetview.panorama.location.latLng.lat()), parseFloat(window.plugin.streetview.panorama.location.latLng.lng()));
                  var heading = google.maps.geometry.spherical.computeHeading(window.plugin.streetview.panorama.location.latLng, new google.maps.LatLng(selectedPortal.getLatLng().lat, selectedPortal.getLatLng().lng));
                  var pov = window.plugin.streetview.panorama.getPov();
                  pov.heading = heading;
                  window.plugin.streetview.panorama.setPov(pov);

//                   var marker = new google.maps.Marker({
//                       map: window.plugin.streetview.panorama,
//                       position: new google.maps.LatLng(selectedPortal.getLatLng().lat, selectedPortal.getLatLng().lng)
//                  });
}
              }, 100);
          }
      }
  }

  window.plugin.streetview.drawMarkers = function() {
      window.plugin.streetview.clearMarkers();
      $.each(window.portals, function(i, portal) {
          var location = new google.maps.LatLng(portal.getLatLng().lat, portal.getLatLng().lng)
	      window.plugin.streetview.addMarker(location, portal.options.data.title);
   	  });
  }

  window.plugin.streetview.setMapOnAll = function(map) {
      for (var i = 0; i < window.plugin.streetview.markerList.length; i++) {
          window.plugin.streetview.markerList[i].setMap(map);
      }
  }

  window.plugin.streetview.addMarker = function(location, title) {
      var marker = new google.maps.Marker({
          position: location,
          map: window.plugin.streetview.panorama,
          title: title
      });
      window.plugin.streetview.markerList.push(marker);
  }

  window.plugin.streetview.clearMarkers = function() {
      window.plugin.streetview.setMapOnAll(null);
      window.plugin.streetview.markerList = [];
  }

	var setup = function() {
        //document.getElementsByTagName('body')[0].innerHTML += '<div id="streetview" style="width:400px;height:400px"></div>' ;
        window.plugin.streetview.initMap();
        addHook('mapDataRefreshEnd', window.plugin.streetview.drawMarkers);
        addHook('portalSelected', window.plugin.streetview.setPosition);
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