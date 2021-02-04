// ==UserScript==
// @id             iitc-plugin-calculate-field-surface
// @name           IITC plugin: Calculate field surface
// @category       Info
// @version        0.0.4.20210204.21732
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/calculatefieldsurface/calculatefieldsurface.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/calculatefieldsurface/calculatefieldsurface.user.js
// @description    [iitc-2021-02-04-021732] Calculate surface of field
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

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
    //(leaving them in place might break the 'About IITC' page or break update checks)
    plugin_info.buildName = 'iitc';
    plugin_info.dateTimeVersion = '20210204.21732';
    plugin_info.pluginId = ' iitc-plugin-calculate-field-surface';
    //END PLUGIN AUTHORS NOTE

    // PLUGIN START ////////////////////////////////////////////////////////

    window.plugin.calculateFieldSurface = function () { };

    window.plugin.calculateFieldSurface.calculateSurface = function (latlngs) {
        const last = latlngs[latlngs.length - 1];
        const path = latlngs.map(latlng => [latlng.lat, latlng.lng]);

        polygon = L.polygon(path);
        const sqMeters = window.plugin.calculateFieldSurface.area(polygon.toGeoJSON().geometry);

        return Math.round(sqMeters * 100) / 100;
    }

    window.plugin.calculateFieldSurface.pnpoly = function (latlngs, point) {
        var length = latlngs.length, c = false;

        for (var i = 0, j = length - 1; i < length; j = i++) {
            if (((latlngs[i].lat > point.lat) != (latlngs[j].lat > point.lat)) &&
                (point.lng < latlngs[i].lng
                    + (latlngs[j].lng - latlngs[i].lng) * (point.lat - latlngs[i].lat)
                    / (latlngs[j].lat - latlngs[i].lat))) {
                c = !c;
            }
        }

        return c;
    }


    window.plugin.calculateFieldSurface.calculate = function (ev) {
        var point = ev.latlng;
        var fields = window.fields;
        var content = "";
        var defaultcontent = "Click on map";
        for (var guid in fields) {
            var field = fields[guid];

            // we don't need to check the field's bounds first. pnpoly is pretty simple math.
            // Checking the bounds is about 50 times slower than just using pnpoly
            if (window.plugin.calculateFieldSurface.pnpoly(field._latlngs, point)) {
                var squareMeters = window.plugin.calculateFieldSurface.calculateSurface(field._latlngs);
                var result = "";
                if (window.plugin.calculateFieldSurface.muinput.value !== undefined && window.plugin.calculateFieldSurface.muinput.value !== "") {
                    const parsed = parseInt(window.plugin.calculateFieldSurface.muinput.value);
                    if (!isNaN(parsed)) {
                        result = " => " + Math.round((parsed * 10000000 / squareMeters)) / 10000 + " MU/1000m2";
                    }
                }
                if (field.options.team == TEAM_RES) {
                    content += "RES field: " + squareMeters + " m2" + result + "<br/>";
                } else {
                    content += "ENL field: " + squareMeters + " m2" + result + "<br/>";
                }
            }
        }
        if (content === "") {
            content = defaultcontent;
        }
        window.plugin.calculateFieldSurface.tooltip.innerHTML = content;

        return false;
    };

    window.plugin.calculateFieldSurface.onBtnClick = function (ev) {
        var btn = window.plugin.calculateFieldSurface.button,
            parent = window.plugin.calculateFieldSurface.parent,
            layer = window.plugin.calculateFieldSurface.layer;
        ev.preventDefault();
        ev.stopPropagation();
        if (btn.classList.contains("active")) {
            if (ev.target.nodeName == "A") {
                map.off("click", window.plugin.calculateFieldSurface.calculate);
                btn.classList.remove("active");
                parent.classList.remove("active");
            } else {

            }
        } else {
            console.log("inactive");

            map.on("click", window.plugin.calculateFieldSurface.calculate);
            btn.classList.add("active");
            parent.classList.add("active");
            setTimeout(function () {
                tooltip.textContent = "Click on map";
            }, 10);
        }
    };

    window.plugin.calculateFieldSurface.area = function (geojson) {
        return window.plugin.calculateFieldSurface.calculateArea(geojson);
    }

    // copied from turf library

    window.plugin.calculateFieldSurface.calculateArea = function (geom) {
        let total = 0;
        let i;
        switch (geom.type) {
            case "Polygon":
                return window.plugin.calculateFieldSurface.polygonArea(geom.coordinates);
            case "MultiPolygon":
                for (i = 0; i < geom.coordinates.length; i++) {
                    total += window.plugin.calculateFieldSurface.polygonArea(geom.coordinates[i]);
                }
                return total;
            case "Point":
            case "MultiPoint":
            case "LineString":
            case "MultiLineString":
                return 0;
        }
        return 0;
    }

    window.plugin.calculateFieldSurface.polygonArea = function (coords) {
        let total = 0;
        if (coords && coords.length > 0) {
            total += Math.abs(window.plugin.calculateFieldSurface.ringArea(coords[0]));
            for (let i = 1; i < coords.length; i++) {
                total -= Math.abs(window.plugin.calculateFieldSurface.ringArea(coords[i]));
            }
        }
        return total;
    }

    /**
     * @private
     * Calculate the approximate area of the polygon were it projected onto the earth.
     * Note that this area will be positive if ring is oriented clockwise, otherwise it will be negative.
     *
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for Polygons on a Sphere",
     * JPL Publication 07-03, Jet Propulsion
     * Laboratory, Pasadena, CA, June 2007 https://trs.jpl.nasa.gov/handle/2014/40409
     *
     * @param {Array<Array<number>>} coords Ring Coordinates
     * @returns {number} The approximate signed geodesic area of the polygon in square meters.
     */
    window.plugin.calculateFieldSurface.ringArea = function (coords) {
        let p1;
        let p2;
        let p3;
        let lowerIndex;
        let middleIndex;
        let upperIndex;
        let i;
        let total = 0;
        const coordsLength = coords.length;

        if (coordsLength > 2) {
            for (i = 0; i < coordsLength; i++) {
                if (i === coordsLength - 2) {
                    // i = N-2
                    lowerIndex = coordsLength - 2;
                    middleIndex = coordsLength - 1;
                    upperIndex = 0;
                } else if (i === coordsLength - 1) {
                    // i = N-1
                    lowerIndex = coordsLength - 1;
                    middleIndex = 0;
                    upperIndex = 1;
                } else {
                    // i = 0 to N-3
                    lowerIndex = i;
                    middleIndex = i + 1;
                    upperIndex = i + 2;
                }
                p1 = coords[lowerIndex];
                p2 = coords[middleIndex];
                p3 = coords[upperIndex];
                total += (window.plugin.calculateFieldSurface.rad(p3[0]) - window.plugin.calculateFieldSurface.rad(p1[0])) * Math.sin(window.plugin.calculateFieldSurface.rad(p2[1]));
            }
            /* earths radius */
            const RADIUS = 6378137;
            total = (total * RADIUS * RADIUS) / 2;
        }
        return total;
    }

    window.plugin.calculateFieldSurface.rad = function (num) {
        return (num * Math.PI) / 180;
    }

    window.plugin.calculateFieldSurface.noClick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    var setup = function () {
        $('<style>').prop('type', 'text/css').html('.leaflet-control-layer-count a\n{\n	\n}\n.leaflet-control-layer-count a.active\n{\n	background-color: #BBB;\n}\n.leaflet-control-layer-count-tooltip\n{\ncolor:rgba(0, 0, 0, 1.0)\n	background-color: rgba(255, 255, 255, 1.0);\n	display: none;\n	height: 24px;\n	left: 30px;\n	line-height: 24px;\n	margin-left: 15px;\n	margin-top: -12px;\n	padding: 0 10px;\n	position: absolute;\n	top: 50%;\n	white-space: nowrap;\n	width: auto;\n}\n.leaflet-control-layer-count .active.leaflet-control-layer-count-tooltip\n{\n	display: block;\n}\n.leaflet-control-layer-count-tooltip:before\n{\n	border-color: transparent rgba(255, 255, 255, 0.6);\n	border-style: solid;\n	border-width: 12px 12px 12px 0;\n	content: "";\n	display: block;\n	height: 0;\n	left: -12px;\n	position: absolute;\n	width: 0;\n}\n').appendTo('head');

        var parent = $(".leaflet-top.leaflet-left", window.map.getContainer());

        var button = document.createElement("a");
        button.className = "leaflet-bar-part";
        button.innerHTML = "🌄"
        button.addEventListener("click", window.plugin.calculateFieldSurface.onBtnClick, true);
        button.title = 'Calculate surface of field';



        var container = document.createElement("div");
        container.className = "leaflet-control-layer-count leaflet-bar leaflet-control";
        container.appendChild(button);

        var tooltip = document.createElement("div");
        tooltip.className = "leaflet-control-layer-count-tooltip";

        container.appendChild(tooltip);

        var information = document.createElement("div");
        information.id = "resultforcount";
        information.text = "Click on map";
        tooltip.appendChild(information);

        var muinput = document.createElement("input");
        muinput.id = "inputfield";
        muinput.type = "text";
        muinput.placeholder = "Enter MU";
        muinput.addEventListener("click", window.plugin.calculateFieldSurface.noClick);
        tooltip.appendChild(muinput);

        parent.append(container);

        window.plugin.calculateFieldSurface.button = button;
        window.plugin.calculateFieldSurface.tooltip = information;
        window.plugin.calculateFieldSurface.parent = tooltip;
        window.plugin.calculateFieldSurface.muinput = muinput;
        window.plugin.calculateFieldSurface.container = container;
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