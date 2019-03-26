// ==UserScript==
// @id             iitc-plugin-egghunt@wintervorst
// @name           IITC plugin: Easter Egg Hunt
// @category       Layer
// @version        0.0.1.20190326.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/egghunt/egghunt.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/egghunt/egghunt.user.js
// @description    [iitc-20190326.013370] Easter Egg Hunt
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
  plugin_info.pluginId = 'egghunt';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.egghunt = function() {};
    window.plugin.egghunt.scriptURL = 'https://script.google.com/macros/s/AKfycbwc1VVSeDKaBvMhJiOESJXQOFb6rRZyylT16I2zfZdKNyOwoVo/exec';
    window.plugin.egghunt.storedtokenkeyname = 'egghunt.installationtoken';
    window.plugin.egghunt.eggsplorer = {};
    window.plugin.egghunt.egglist = [];
    window.plugin.egghunt.egglayerlist = {};
    window.plugin.egghunt.selectedportal = {};

    var setup = function() {
        window.plugin.egghunt.addStyling();
        window.plugin.egghunt.egglayer = new L.featureGroup();
	    window.addLayerGroup('Eggs', window.plugin.egghunt.egglayer, true);
        window.plugin.egghunt.egglayer.on("click", window.plugin.egghunt.eggClicked);

        window.plugin.egghunt.initControls();
        window.plugin.egghunt.getUpdate();
        window.addHook('portalSelected',  window.plugin.egghunt.portalSelected);
        map.on('zoomend', function() { window.plugin.egghunt.updateEggsplorer(); });
    }

     window.plugin.egghunt.updateInterface = function(data) {
         console.log(data);
         window.plugin.egghunt.egglist = data.egglist;
         if (window.plugin.egghunt.egglist != null) {
             for (var i = 0; i < window.plugin.egghunt.egglist.length; i++) {
                 window.plugin.egghunt.drawEgg(window.plugin.egghunt.egglist[i]);
             }
         }
    }

    window.plugin.egghunt.eggIcon = L.icon({
        iconUrl: 'https://github.com/Wintervorst/iitc/raw/master/plugins/egghunt/assets/easteregg.png',
        iconSize:     [32, 42], // size of the icon
        iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    window.plugin.egghunt.drawEgg = function(egg) {
        var markerLatLng = L.latLng(egg.lat,egg.lng);
        var icon = window.plugin.egghunt.eggIcon;

        var marker = L.marker(markerLatLng, {
            icon: icon,
            data: egg,
            guid: egg.guid,
          }).addTo(window.plugin.egghunt.egglayer);
        window.plugin.egghunt.egglayerlist[egg.guid] = marker;
    }

    window.plugin.egghunt.eggClicked = function(event) {
        console.log(event.layer.options.data);
        window.plugin.egghunt.drawInputPopop(event.layer, L.latLng(event.layer.options.data.lat,event.layer.options.data.lng));
    }

    window.plugin.egghunt.initControls = function() {
         var newDiv = document.createElement("div");  
        newDiv.setAttribute('id', "eggsplorer");
        newDiv.setAttribute('style', "height:80px;width:200px;position:absolute;z-index:9000;top:0;left:42px;background-color:#FFF; padding:5px;");  

        document.body.appendChild(newDiv);
        window.plugin.egghunt.eggsplorer = newDiv;

        window.plugin.egghunt.initFormResponse();
    }

    window.plugin.egghunt.updateEggsplorer = function() {
        window.plugin.egghunt.eggsplorer.innerHTML = ''
        +
        + Math.round(2000 / map.getZoom())
        + ' eieren nog verstopt <br/>'
        + Math.round(120 / map.getZoom())
        + ' eieren reeds gevonden <br/><br/>'
        + '<a href="#">Bekijk hints</a><br/>'
    }

    window.plugin.egghunt.portalSelected = function(portal) {
        var selectedPortal = window.portals[portal.selectedPortalGuid];
        if (selectedPortal !== undefined) {
            if (selectedPortal !== window.plugin.egghunt.selectedportal) {
                  window.plugin.egghunt.selectedportal = selectedPortal;
                  var existingLayer = window.plugin.egghunt.egglayerlist[portal.selectedPortalGuid];
                  if (existingLayer !== undefined)  {
                      selectedPortal = existingLayer;
                  }

                  var latlng = selectedPortal.getLatLng();
                  window.plugin.egghunt.drawInputPopop(selectedPortal, latlng);
              }
          }
    }

    window.plugin.egghunt.drawInputPopop = function(portal, latlng) {
        var formpopup = L.popup();
        
        formpopup.setLatLng(latlng);

        var hinttext = '';
        if (portal.options.data.hinttext !== undefined) {
            hinttext = portal.options.data.hinttext;
        }

        var portaltitle = portal.options.data.title;
        if (portaltitle === undefined) {
            portaltitle = portal.options.data.portaltitle;
        }

        var imageurl = portal.options.data.image;
        if (portal.options.data.portaltitle !== undefined) {
            imageurl = portal.options.data.imageurl;
        }

        var formContent = '<div style="width:200px;height:180px;margin-top:30px;"><form id="submit-to-sheet" name="submit-to-google-sheet">'
        + '<label>Hinttext:'
        + '<textarea class="hintinput" id="hinttext" name="hinttext" style="width:100%;height:80px" placeholder="Type your hints here. E.g. My feet are always in the water">' + hinttext + '</textarea>'
        + '</label>';

        if (portal.options.data.id !== undefined) {
           formContent += '<input name="id" id="id" type="hidden" value="' + portal.options.data.id + '">';
        }

        formContent += '<input name="lat" id="ticklat" type="hidden" value="' + latlng.lat + '">'
        + '<input name="lng" id="ticklng" type="hidden" value="' + latlng.lng + '">'
        + '<input name="guid" id="guid" type="hidden" value="' + portal.options.guid + '">'
        + '<input name="portaltitle" id="portaltitle" type="hidden" value="' + portaltitle + '">'
        + '<input name="imageurl" id="imageurl" type="hidden" value="' + imageurl + '">'
        + '<input name="team" id="team" type="hidden" value="' + window.PLAYER.team + '">'
        + '<input name="nickname" id="nickname" type="hidden" value="' + window.PLAYER.nickname + '">'
        + '<input name="token" id="token" type="hidden" value="' + window.plugin.egghunt.getOrSetInstallationToken() + '">'
        + '<input name="submitbuttonvalue" id="submittedstate" type="hidden">'
        + '<button type="submit" id="hidebutton" value="hide" style="clear:both; float:left; width:100%;height:30px;">Hide Egg</button>'
        + '<button type="submit" id="cancelbutton" value="cancel" style="clear:both; float:left; width:100%;height:30px;">Cancel</button>'
        + '</form>';

        formpopup.setContent(formContent + '</div>');
        formpopup.openOn(window.map);
    }

    window.plugin.egghunt.getUpdate = function() {
        var northWest = map.getBounds().getNorthWest();
        var southEast = map.getBounds().getSouthWest();

        $.ajax({
            url: window.plugin.egghunt.scriptURL + '?nickname=' + window.PLAYER.nickname + '&team=' + window.PLAYER.team + '&token=' + window.plugin.egghunt.getOrSetInstallationToken() + '&nwlat=' +northWest.lat  + '&nwlng=' +northWest.lng + '&selat=' +southEast.lat + '&selng=' +southEast.lng,
            type: 'GET',
            dataType: 'text',
            success: function (data, status, header) {                
               window.plugin.egghunt.updateInterface(JSON.parse(data));
            },
            error: function (x, y, z) {
                console.log('Error message: ' + x + '\n' + y + '\n' + z);
            }
        });
    }

    window.plugin.egghunt.eggUpdated = function(data) {
           var existingLayer = window.plugin.egghunt.egglayerlist[data.guid];
           if (existingLayer !== undefined)  {
               window.plugin.egghunt.egglayer.removeLayer(existingLayer);
           }
           window.plugin.egghunt.drawEgg(data);

         if (window.plugin.egghunt.egglist != null) {
             for (var i = 0; i < window.plugin.egghunt.egglist.length; i++) {
                 if (window.plugin.egghunt.egglist[i].guid === data.guid) {
                     window.plugin.egghunt.egglist.splice(i, 1);
                 }
             }
         }
        window.plugin.egghunt.egglist.push(data);
    }

    window.plugin.egghunt.initFormResponse = function() {
     $('body').on('submit','#submit-to-sheet', function(e) {
            e.preventDefault();
                 e.stopPropagation();
                 map.closePopup();
                 var targetId = $(e.target).attr('id');
                 if (targetId === undefined && !(targetId === 'hidebutton'))
                 {
                     return false;
                 }

             var status = $(e.target).val();


             $.ajax({
        			url: window.plugin.egghunt.scriptURL,
        			type: 'POST',
            	  data: new FormData(e.currentTarget),
                processData: false,
        			contentType: false,
        			success: function (data, status, header) {
                        window.plugin.egghunt.eggUpdated(data);
        			},
        		error: function (x, y, z) {
            		console.log('Error message: ' + x + '\n' + y + '\n' + z);
        		}
    					});

        });
    }

        // Create a token for this installation if it did not already exist
    window.plugin.egghunt.getOrSetInstallationToken = function() {
	    var token = localStorage.getItem(window.plugin.egghunt.storedtokenkeyname);
	    if (token === undefined || token === null) {
		    token = window.plugin.egghunt.generateToken();
			localStorage.setItem(window.plugin.egghunt.storedtokenkeyname, token);
		}
		return token;
	}

    window.plugin.egghunt.generateToken = function() {
		// Source: https://gist.github.com/jed/982883
        var guid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		)

        return guid.replace(/-/g,"");
	}

     window.plugin.egghunt.addStyling = function() {
              $("<style>")
                  .prop("type", "text/css")
                  .html(".plugin-egghunt-name {\
        font-size: 14px;\
              font-weight: bold;\
              color: gold;\
              opacity: 0.7;\
              text-align: center;\
              text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000; \
              pointer-events: none;\
            } ")
            .appendTo("head");
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