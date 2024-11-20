// ==UserScript==
// @id             iitc-plugin-buttontest@wintervorst
// @name           IITC plugin: button test
// @category       Layer
// @version        0.0.2.20241120.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/buttontest/buttontest.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/buttontest/buttontest.user.js
// @description    [iitc-20241120.013370] Test buttons on mobile
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
  plugin_info.dateTimeVersion = '20190311.013370';
  plugin_info.pluginId = 'buttontest';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.buttontest = function() {};

    var setup = function() {
        L.control.myControl({
            position: 'topleft'
        }).addTo(map);
    }

 L.Control.MyControl = L.Control.extend({
  onAdd: function(map) {
    var el = L.DomUtil.create('div', 'leaflet-bar my-control');
    el.innerHTML = 'Here';
    return el;
  },

  onRemove: function(map) {
    // Nothing to do here
  }
});

 L.control.myControl = function(opts) {
  return new L.Control.MyControl(opts);
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