// ==UserScript==
// @id             iitc-plugin-toggle-uniques
// @name           IITC plugin: Toggle uniques
// @category       Info
// @version        0.0.1.20210208.21732
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/toggleuniques/toggleuniques.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/toggleuniques/toggleuniques.user.js
// @description    [iitc-2021-02-08-021732] Toggle uniques
// @include        https://intel.ingress.com/*
// @include        http://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
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
    plugin_info.dateTimeVersion = '20210208.21732';
    plugin_info.pluginId = ' iitc-plugin-toggle-uniques';
    //END PLUGIN AUTHORS NOTE

    // PLUGIN START ////////////////////////////////////////////////////////

    window.plugin.toggleuniques = function () { };

    window.plugin.toggleuniques.capturedportals = {};
    window.plugin.toggleuniques.visitedportals = {};
    window.plugin.toggleuniques.layerlist = {};

    window.decodeArray = function () { };


    function parseMod(arr) {
        if (arr == null) { return null; }
        return {
            owner: arr[0],
            name: arr[1],
            rarity: arr[2],
            stats: arr[3],
        };
    }
    function parseResonator(arr) {
        if (arr == null) { return null; }
        return {
            owner: arr[0],
            level: arr[1],
            energy: arr[2],
        };
    }
    function parseArtifactBrief(arr) {
        if (arr === null) return null;

        // array index 0 is for fragments at the portal. index 1 is for target portals
        // each of those is two dimensional - not sure why. part of this is to allow for multiple types of artifacts,
        // with their own targets, active at once - but one level for the array is enough for that

        // making a guess - first level is for different artifact types, second index would allow for
        // extra data for that artifact type

        function decodeArtifactArray(arr) {
            var result = {};
            for (var i = 0; i < arr.length; i++) {
                // we'll use the type as the key - and store any additional array values as the value
                // that will be an empty array for now, so only object keys are useful data
                result[arr[i][0]] = arr[i].slice(1);
            }
            return result;
        }

        return {
            fragment: decodeArtifactArray(arr[0]),
            target: decodeArtifactArray(arr[1]),
        };
    }

    function parseArtifactDetail(arr) {
        if (arr == null) { return null; }
        // empty artifact data is pointless - ignore it
        if (arr.length == 3 && arr[0] == "" && arr[1] == "" && arr[2].length == 0) { return null; }
        return {
            type: arr[0],
            displayName: arr[1],
            fragments: arr[2],
        };
    }


    //there's also a 'placeholder' portal - generated from the data in links/fields. only has team/lat/lng

    var CORE_PORTA_DATA_LENGTH = 4;
    function corePortalData(a) {
        return {
            // a[0] == type (always 'p')
            team: a[1],
            latE6: a[2],
            lngE6: a[3],
            uniquestatus: a[18]
        }
    };

    var SUMMARY_PORTAL_DATA_LENGTH = 14;
    function summaryPortalData(a) {
        return {
            level: a[4],
            health: a[5],
            resCount: a[6],
            image: a[7],
            title: a[8],
            ornaments: a[9],
            mission: a[10],
            mission50plus: a[11],
            artifactBrief: parseArtifactBrief(a[12]),
            timestamp: a[13],
            uniquestatus: a[18]
        };
    };

    var DETAILED_PORTAL_DATA_LENGTH = SUMMARY_PORTAL_DATA_LENGTH + 4;


    window.decodeArray.portalSummary = function (a) {
        if (!a) return undefined;
        if (a[0] != 'p') throw 'Error: decodeArray.portalSUmmary - not a portal';

        if (a.length == CORE_PORTA_DATA_LENGTH) {
            return corePortalData(a);
        }

        // NOTE: allow for either summary or detailed portal data to be passed in here, as details are sometimes
        // passed into code only expecting summaries
        if (a.length != SUMMARY_PORTAL_DATA_LENGTH && a.length != DETAILED_PORTAL_DATA_LENGTH) {
            //console.warn('Portal summary length changed - portal details likely broken!');
            //debugger;
        }

        return $.extend(corePortalData(a), summaryPortalData(a));
    }

    window.decodeArray.portalDetail = function (a) {

        if (!a) return undefined;

        if (a[0] != 'p') throw 'Error: decodeArray.portalDetail - not a portal';

        if (a.length != DETAILED_PORTAL_DATA_LENGTH) {
            //console.warn('Portal detail length changed - portal details may be wrong');
            //debugger;
        }

        //TODO look at the array values, make a better guess as to which index the mods start at, rather than using the hard-coded SUMMARY_PORTAL_DATA_LENGTH constant


        // the portal details array is just an extension of the portal summary array
        // to allow for niantic adding new items into the array before the extended details start,
        // use the length of the summary array
        return $.extend(corePortalData(a), summaryPortalData(a), {
            mods: a[SUMMARY_PORTAL_DATA_LENGTH + 0].map(parseMod),
            resonators: a[SUMMARY_PORTAL_DATA_LENGTH + 1].map(parseResonator),
            owner: a[SUMMARY_PORTAL_DATA_LENGTH + 2],
            artifactDetail: parseArtifactDetail(a[SUMMARY_PORTAL_DATA_LENGTH + 3]),
        });

    }


    window.plugin.toggleuniques.update = function () {

        if (!window.map.hasLayer(window.plugin.toggleuniques.visitedPortalsLayer)
            && !window.map.hasLayer(window.plugin.toggleuniques.capturedPortalsLayer)
            && !window.map.hasLayer(window.plugin.toggleuniques.noncapturedPortalsLayer)
            && !window.map.hasLayer(window.plugin.toggleuniques.nonvisitedPortalsLayer)) {
            window.plugin.toggleuniques.restoreHiddenCaptured();
            window.plugin.toggleuniques.restoreHiddenVisited();

            return;
        }

        if (window.map.hasLayer(window.plugin.toggleuniques.visitedPortalsLayer)) {
            window.plugin.toggleuniques.visitedPortalsLayer.clearLayers();

            $.each(window.portals, function (i, portal) {
                window.plugin.toggleuniques.drawvisited(portal);
            });
        }

        if (window.map.hasLayer(window.plugin.toggleuniques.capturedPortalsLayer)) {
            window.plugin.toggleuniques.capturedPortalsLayer.clearLayers();

            $.each(window.portals, function (i, portal) {
                window.plugin.toggleuniques.drawcaptured(portal);
            });
        }

        if (window.map.hasLayer(window.plugin.toggleuniques.noncapturedPortalsLayer)) {
            window.plugin.toggleuniques.capturedPortalsLayer.clearLayers();

            $.each(window.portals, function (i, portal) {
                window.plugin.toggleuniques.hidecaptured(portal);
            });
        } else {
            window.plugin.toggleuniques.restoreHiddenCaptured();
        }

        if (window.map.hasLayer(window.plugin.toggleuniques.nonvisitedPortalsLayer)) {
            window.plugin.toggleuniques.visitedPortalsLayer.clearLayers();
            window.plugin.toggleuniques.capturedPortalsLayer.clearLayers();

            $.each(window.portals, function (i, portal) {
                window.plugin.toggleuniques.hidevisited(portal);
            });
        } else {
            window.plugin.toggleuniques.restoreHiddenVisited();
        }
    }

    window.plugin.toggleuniques.restoreHiddenCaptured = function () {
        $.each(window.plugin.toggleuniques.hiddencapturedportals, function (i, portal) {
            map.addLayer(portal);
        });

        window.plugin.toggleuniques.hiddencapturedportals = [];
    }

    window.plugin.toggleuniques.restoreHiddenVisited = function () {
        $.each(window.plugin.toggleuniques.hiddenvisitedportals, function (i, portal) {
            map.addLayer(portal);
        });

        window.plugin.toggleuniques.hiddenvisitedportals = [];
    }

    window.plugin.toggleuniques.drawvisited = function (portal) {
        if (!(portal.options.data && portal.options.data.uniquestatus && (portal.options.data.uniquestatus === 3 || portal.options.data.uniquestatus === 1))) {
            return;
        }
        //    window.plugin.toggleuniques.visitedportals[i] = true;
        window.plugin.toggleuniques.draw(portal, 'orange', 30, window.plugin.toggleuniques.visitedPortalsLayer);

    }

    window.plugin.toggleuniques.drawcaptured = function (portal) {
        if (!(portal.options.data && portal.options.data.uniquestatus && portal.options.data.uniquestatus === 3)) {
            return;
        }
        //    window.plugin.toggleuniques.capturedportals[i] = true;
        window.plugin.toggleuniques.draw(portal, 'teal', 35, window.plugin.toggleuniques.capturedPortalsLayer);

    }

    window.plugin.toggleuniques.hiddencapturedportals = [];


    window.plugin.toggleuniques.hidecaptured = function (portal) {
        if (!(portal.options.data && portal.options.data.uniquestatus && portal.options.data.uniquestatus === 3)) {
            return;
        }
        window.plugin.toggleuniques.hiddencapturedportals.push(portal);

        map.removeLayer(portal);
    }


    window.plugin.toggleuniques.hiddenvisitedportals = [];

    window.plugin.toggleuniques.hidevisited = function (portal) {
        if (!(portal.options.data && portal.options.data.uniquestatus && (portal.options.data.uniquestatus === 3 || portal.options.data.uniquestatus === 1))) {
            return;
        }
        window.plugin.toggleuniques.hiddenvisitedportals.push(portal);

        map.removeLayer(portal);
    }

    window.plugin.toggleuniques.draw = function (portal, color, range, layer) {
        if (!(portal.options.data && portal.options.data.uniquestatus)) {
            return;
        }
        // Create a new location object for the portal
        var coo = portal._latlng;
        var latlng = new L.LatLng(coo.lat, coo.lng);

        // Specify the no submit circle options
        var circleOptions = { color: color, opacity: 1, weight: 1, clickable: false, interactive: false };

        // Create the circle object with specified options
        var circle = new L.Circle(latlng, range, circleOptions);

        circle.addTo(layer);
    }

    window.plugin.toggleuniques.setSelected = function (a) {
        if (a.display) {
            var selectedLayer = window.plugin.toggleuniques.layerlist[a.name];
            if (selectedLayer !== undefined) {
                if (!window.map.hasLayer(selectedLayer)) {
                    window.map.addLayer(selectedLayer);
                }
                if (window.map.hasLayer(selectedLayer)) {
                    window.plugin.toggleuniques.update();
                }
            }
        } else {

            window.plugin.toggleuniques.update();

        }
    }

    var setup = function () {

        window.plugin.toggleuniques.visitedPortalsLayer = new L.LayerGroup();
        window.addLayerGroup('Highlight visited portals', window.plugin.toggleuniques.visitedPortalsLayer, true);
        window.plugin.toggleuniques.layerlist['Highlight visited portals'] = window.plugin.toggleuniques.visitedPortalsLayer;

        window.plugin.toggleuniques.capturedPortalsLayer = new L.LayerGroup();
        window.addLayerGroup('Highlight captured portals', window.plugin.toggleuniques.capturedPortalsLayer, true);
        window.plugin.toggleuniques.layerlist['Highlight captured portals'] = window.plugin.toggleuniques.capturedPortalsLayer;

        window.plugin.toggleuniques.nonvisitedPortalsLayer = new L.LayerGroup();
        window.addLayerGroup('Hide visited portals', window.plugin.toggleuniques.nonvisitedPortalsLayer, false);
        window.plugin.toggleuniques.layerlist['Hide visited portals'] = window.plugin.toggleuniques.nonvisitedPortalsLayer;

        window.plugin.toggleuniques.noncapturedPortalsLayer = new L.LayerGroup();
        window.addLayerGroup('Hide captured portals', window.plugin.toggleuniques.noncapturedPortalsLayer, false);
        window.plugin.toggleuniques.layerlist['Hide captured portals'] = window.plugin.toggleuniques.noncapturedPortalsLayer;

        addHook('mapDataRefreshEnd', window.plugin.toggleuniques.update);
        window.pluginCreateHook('displayedLayerUpdated');

        window.addHook('displayedLayerUpdated', window.plugin.toggleuniques.setSelected);
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