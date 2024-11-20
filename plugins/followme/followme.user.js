// ==UserScript==
// @id             iitc-plugin-follow-me
// @name           IITC plugin: Follow me
// @category       Utility
// @version        0.0.3.20241120.13371
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/followme/followme.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/followme/followme.user.js
// @description    0.0.3 - Follow me! - Keeps your current location centered on the map
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @include        http://intel.ingress.com/*
// @include        https://intel.ingress.com/*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @match          http://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @match          https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  // ensure plugin framework is there, even if iitc is not yet loaded
  if (typeof window.plugin !== 'function') window.plugin = function () { }

  //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
  //(leaving them in place might break the 'About IITC' page or break update checks)
  plugin_info.buildName = 'iitc'
  plugin_info.dateTimeVersion = '20210610.13371'
  plugin_info.pluginId = ' iitc-plugin-follow-me'
  //END PLUGIN AUTHORS NOTE

  // PLUGIN START ////////////////////////////////////////////////////////

  window.plugin.followme = function () { }
    window.plugin.followme.refreshDelay = 15000; // milliseconds
    window.plugin.followme.latestRefresh = Date.now();
    window.plugin.followme.latestLat = '';
    window.plugin.followme.latestLng = '';

  var setup = function () {
     map.locate({
        watch: true,
        enableHighAccuracy: true,
        }).on('locationfound', (e) => {
         var lat = e.latitude;
         var lng = e.longitude;

         if (lat !== window.plugin.followme.latestLat || lng !== window.plugin.followme.latestLng) {
            if ((window.plugin.followme.latestRefresh + window.plugin.followme.refreshDelay + Math.floor((Math.random() * 1000) + 1)) < Date.now()) {
                window.plugin.followme.latestRefresh = Date.now();
                var location = [lat, lng];
                window.plugin.followme.latestLat = lat;
                window.plugin.followme.latestLng = lng;
                map.setView(location);
            }
         }

    });
  }


  // PLUGIN END //////////////////////////////////////////////////////////
  setup.info = plugin_info //add the script info data to the function as a property
  if (!window.bootPlugins) window.bootPlugins = []
  window.bootPlugins.push(setup)
  // if IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === 'function') setup()
} // wrapper end
// inject code into site context
var script = document.createElement('script')
var info = {}
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script)
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  }
script.appendChild(
  document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');')
)
  ; (document.body || document.head || document.documentElement).appendChild(
    script
  )
