// ==UserScript==
// @id             iitc-plugin-portaljson@wintervorst
// @name           IITC plugin: Portal detail as Json
// @category       Layer
// @version        0.0.1.20190326.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/portaljson/portaljson.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/portaljson/portaljson.user.js
// @description    [iitc-20190326.013370] Returns a page with only json
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
  plugin_info.dateTimeVersion = '20190326.013370';
  plugin_info.pluginId = 'portaljson';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.portaljson = function() {};
  window.plugin.portaljson.portalguid = '7a5d62b4bfec4275882fff15811cb39a.16';

    window.MAX_IDLE_TIME = 0; // Stops iitc from loading datatiles
    var setup = function() {
        setTimeout(function() {
            window.plugin.portaljson.loaded();
        }, 1);
    }

    window.plugin.portaljson.loaded = function() {
        var guid = window.plugin.portaljson.portalguid;
         window.postAjax('getPortalDetails', {guid:guid},
                        function(data,textStatus,jqXHR) { window.plugin.portaljson.detailLoaded(guid, data, true); },
                        function() { }
        );
    }

    window.plugin.portaljson.detailLoaded = function(result, data, isbool) {
        document.body.innerHTML = JSON.stringify(data);
        document.body.style.background = "#FFF";        
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