// ==UserScript==
// @id             iitc-plugin-go-capture
// @name           IITC plugin: Go Capture!
// @category       Info
// @version        0.0.3.20210526.11236
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/gocapture/gocapture.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/gocapture/gocapture.user.js
// @description    [iitc-2021-05-26-112346] Go Capture! - Highlights available unique captures. Captures are stored in the browser for more reliable results.
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
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
    //(leaving them in place might break the 'About IITC' page or break update checks)
    plugin_info.buildName = 'iitc';
    plugin_info.dateTimeVersion = '20210526.11234';
    plugin_info.pluginId = ' iitc-plugin-go-capture';
    //END PLUGIN AUTHORS NOTE

    // PLUGIN START ////////////////////////////////////////////////////////

    window.plugin.gocapture = function () { };

    window.plugin.gocapture.layerlist = {};
    window.plugin.gocapture.capturedportals = {};
    window.plugin.gocapture.localstoragekey = "gocapture.capturedportals"

    window.plugin.gocapture.update = function () {

        if (!window.map.hasLayer(window.plugin.gocapture.uncapturedAvailableLayer))
            return;

        if (window.map.hasLayer(window.plugin.gocapture.uncapturedAvailableLayer)) {
            window.plugin.gocapture.uncapturedAvailableLayer.clearLayers();

            $.each(window.portals, function (i, portal) {
                window.plugin.gocapture.drawAvailableUncaptured(portal);
            });
        }
    }

    window.plugin.gocapture.addcaptured = function (guid) {
        window.plugin.gocapture.capturedportals[guid] = true;        
        if (window.plugin.gocapture.capturedportals) {
            localStorage.setItem(window.plugin.gocapture.localstoragekey, JSON.stringify(window.plugin.gocapture.capturedportals));
        }
    }

    window.plugin.gocapture.loadcaptured = function () {
        var stored = localStorage.getItem(window.plugin.gocapture.localstoragekey);
        if (stored) {
            window.plugin.gocapture.capturedportals = JSON.parse(stored);
        }
    }

    window.plugin.gocapture.drawAvailableUncaptured = function (portal) {

        if (!window.plugin.gocapture.capturedportals[portal.options.guid]) {

            if (portal.options.data.agentCaptured) {
                window.plugin.gocapture.addcaptured(portal.options.guid);
            } else {
                if (portal.options.data.team === "N" || (portal.options.data.team === "E" && window.PLAYER.team == "RESISTANCE") || (portal.options.data.team === "R" && window.PLAYER.team == "ENLIGHTENED")) {

                    window.plugin.gocapture.draw(portal, 'teal', 30, 5, 1, 'teal', 0, window.plugin.gocapture.uncapturedAvailableLayer);
                    window.plugin.gocapture.draw(portal, 'white', 25, 5, 1, 'purple', 0.3, window.plugin.gocapture.uncapturedAvailableLayer);

                }
            }
        }
    }

    window.plugin.gocapture.draw = function (portal, color, range, weight, opacity, fillColor, fillOpacity, layer) {
        // Create a new location object for the portal
        var coo = portal._latlng;
        var latlng = new L.LatLng(coo.lat, coo.lng);

        // Specify the no submit circle options
        var circleOptions = { color: color, opacity: opacity, weight: weight, fillColor: fillColor, fillOpacity: fillOpacity, clickable: false, interactive: false };

        // Create the circle object with specified options
        var circle = new L.Circle(latlng, range, circleOptions);

        circle.addTo(layer);
    }

    window.plugin.gocapture.setSelected = function (a) {
        if (a.display) {
            var selectedLayer = window.plugin.gocapture.layerlist[a.name];
            if (selectedLayer !== undefined) {
                if (!window.map.hasLayer(selectedLayer)) {
                    window.map.addLayer(selectedLayer);
                }
                if (window.map.hasLayer(selectedLayer)) {
                    window.plugin.gocapture.update();
                }
            }
        } else {
            window.plugin.gocapture.update();
        }
    }

    var setup = function () {

        window.plugin.gocapture.loadcaptured();
        window.plugin.gocapture.uncapturedAvailableLayer = new L.LayerGroup();
        window.addLayerGroup('Go Capture! - Portals', window.plugin.gocapture.uncapturedAvailableLayer, true);
        window.plugin.gocapture.layerlist['Go Capture! - Portals'] = window.plugin.gocapture.uncapturedAvailableLayer;

        addHook('mapDataRefreshEnd', window.plugin.gocapture.update);
        window.pluginCreateHook('displayedLayerUpdated');

        window.addHook('displayedLayerUpdated', window.plugin.gocapture.setSelected);
        window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;
    }

    // Overload for IITC default in order to catch the manual select/deselect event and handle it properly
    // Update layerGroups display status to window.overlayStatus and localStorage 'ingress.intelmap.layergroupdisplayed'
    window.updateDisplayedLayerGroupModified = function (name, display) {
        overlayStatus[name] = display;
        localStorage['ingress.intelmap.layergroupdisplayed'] = JSON.stringify(overlayStatus);
        runHooks('displayedLayerUpdated', { name: name, display: display });
    }

    // PLUGIN END //////////////////////////////////////////////////////////
    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
