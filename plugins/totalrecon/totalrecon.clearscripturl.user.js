// ==UserScript==
// @id             iitc-plugin-totalrecon-clearscripturl@wintervorst
// @name           IITC plugin: Total Recon - Clear script URL
// @category       Highlighter
// @version        0.0.2.20241120.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/totalrecon.clearscripturl.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/totalrecon.clearscripturl.user.js
// @description    [iitc-20241120.013370] Clear the script url from localstorage to be able to set a new one in total recon
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

// Level 6 cells are used to determine where to find the next candidate
// TODO: Add counters and percentages to cells
// TODO: Draw every next day in another color
// TODO: Check results when idling a review or skipping

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
  plugin_info.buildName = 'iitc';
  plugin_info.dateTimeVersion = '20180810.013370';
  plugin_info.pluginId = 'totalreconclearscripturl';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.totalrecon.clearscripturl = function() {};
  
  // Initialize the plugin
  var setup = function() {    
	localStorage.removeItem('totalrecon.scriptURL');    
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