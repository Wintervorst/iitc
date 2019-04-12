// ==UserScript==
// @id             iitc-plugin-egghunt@wintervorst
// @name           IITC plugin: Easter Egg Hunt
// @category       Layer
// @version        0.0.3.20190412.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/egghunt/egghunt.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/egghunt/egghunt.user.js
// @description    [iitc-20190412.013370] Easter Egg Hunt
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
  plugin_info.dateTimeVersion = '20190412.013370';
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
    window.plugin.egghunt.datarequestdate = '';
    window.plugin.egghunt.requesteddata = '';
    window.plugin.egghunt.isbunny = false;

    var setup = function() {
        window.plugin.egghunt.getBunnyEnabled();
        window.plugin.egghunt.initButtonControl();
        window.plugin.egghunt.addStyling();
        window.plugin.egghunt.egglayer = new L.featureGroup();
        window.addLayerGroup('Eggs', window.plugin.egghunt.egglayer, true);
        window.plugin.egghunt.egglayer.on("click", window.plugin.egghunt.eggClicked);

        window.plugin.egghunt.initControls();
        setTimeout(function() {
           // window.plugin.egghunt.getUpdate();
        }, 1);
       
        window.addHook('portalSelected',  window.plugin.egghunt.portalSelected);
        //map.on('zoomend', function() {  window.plugin.egghunt.getUpdate(); });
        map.on('moveend', function() {  window.plugin.egghunt.getUpdate(); });
    }

    window.plugin.egghunt.updateView = function() {
        if (window.plugin.egghunt.requesteddata != '')   {
            window.plugin.egghunt.updateInterface(window.plugin.egghunt.requesteddata, window.plugin.egghunt.datarequestdate);
        }
    }

    window.plugin.egghunt.getBunnyEnabled = function() {
        var stateEnabled = localStorage.getItem('egghunt.bunnyenabled');
        if (stateEnabled === undefined || stateEnabled === null || stateEnabled === '' || stateEnabled === "true") {
            window.plugin.egghunt.isbunny = true;
            localStorage.setItem('egghunt.bunnyenabled', true);
        } else {
            window.plugin.egghunt.isbunny = false;
        }
    }

     window.plugin.egghunt.updateInterface = function(data, requestDate) {
         if (requestDate === window.plugin.egghunt.datarequestdate) {
             console.log(data);
             window.plugin.egghunt.egglist = data.egglist;
             if (window.plugin.egghunt.egglist != null) {
                 window.plugin.egghunt.egglayer.clearLayers();
                 for (var i = 0; i < window.plugin.egghunt.egglist.length; i++) {
                     window.plugin.egghunt.drawEgg(window.plugin.egghunt.egglist[i]);
                 }
             }

             window.plugin.egghunt.updateEggsplorer(data);
         }
    }

    window.plugin.egghunt.eggIcon = L.icon({
        iconUrl: 'https://github.com/Wintervorst/iitc/raw/master/plugins/egghunt/assets/easteregg.png',
        iconSize:     [32, 42], // size of the icon
        iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    window.plugin.egghunt.drawEgg = function(egg) {
        if (egg.foundbyplayer != "" || window.plugin.egghunt.isbunny) {
            var markerLatLng = L.latLng(egg.lat,egg.lng);
            var icon = window.plugin.egghunt.eggIcon;
            if (egg.foundbyplayer != "") {
               icon.html = egg.foundbyplayer;
            } else {
               icon.html = "";
            }

            var marker = L.marker(markerLatLng, {
                icon: icon,
                data: egg,
                guid: egg.guid
            }).addTo(window.plugin.egghunt.egglayer);
            window.plugin.egghunt.egglayerlist[egg.guid] = marker;
        }
    }

    window.plugin.egghunt.eggClicked = function(event) {
        if (window.plugin.egghunt.isbunny) {
            window.plugin.egghunt.drawInputPopop(event.layer, L.latLng(event.layer.options.data.lat,event.layer.options.data.lng));
        }
    }

    window.plugin.egghunt.initControls = function() {
         var newDiv = document.createElement("div");  
        newDiv.setAttribute('id', "easteregghuntmain");

        document.body.appendChild(newDiv);
        window.plugin.egghunt.eggsplorer = newDiv;

        window.plugin.egghunt.initFormResponse();
    }

    window.plugin.egghunt.updateEggsplorer = function(data) {
        var htmlContent = ''
        + '<div class="head-container">'
        + '  <div class="head head-column">Easter Egg Hunt 2019</div>'
        + '	 <div class="head head-column">Eggsplorer</div>'
        + '  <div class="head head-column">Hints</div>'
        + '</div>'
        + '<div class="column-container">'
        + '  <div class="column column-left">'
        + '    <div id="toplistinfo">'
        + '	     <div class="counter" id="huntcounter">'
        + '	       <div class="countertitle">'
        + '		     Hunt starts in:'
        + '	       </div>'
        + '        <div id="counterclock" class="counterclock">'
        +            data.startdatetime
        + '        </div>'
        + '        <div class="hunterstats"> '
        + '          <div id="signedupcount" class="signedupcount">' + data.huntercount + ' hunters signed up</div>'
        + '          <div id="latestsignup" class="latestsignup">Latest signup ('+ data.latesthunter.timestamp  +') : <span class="' + data.latesthunter.team.toLowerCase().substring(0,3) + '">' + data.latesthunter.huntername + '</div>'
        + '        </div>'
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '  <div class="column column-center">'
        + '    <div id="eggsplorer">'
        + '      <div class="eggsplorer-content collapsable">'
        + '	       <div id="eggshidden">' + data.eggsplorer.hidden + ' eggs hidden</div>'
        + '	       <div id="eggsfound">' + data.eggsplorer.found + ' eggs found</div>'
        + '      </div>'
        + '    <div class="head">Egglog</div>'
        + '    <div id="egglog">'
                 htmlContent +=  window.plugin.egghunt.getLogList(data);
                 htmlContent += ''
        + '    </div>'
        + '  </div>'
        + '</div>'
        + '<div class="column column-right">'
        + '  <div id="hintlist">';
        htmlContent +=  window.plugin.egghunt.getHintList(data);
        htmlContent += ''
        + '	 </div>'
        + '</div>'
        + '</div>'
        + '</div>';

        window.plugin.egghunt.eggsplorer.innerHTML = htmlContent;
    }

    window.plugin.egghunt.getLogList = function(data) {
        var returnValue = '';
        if (data.latestfindslist != null && data.latestfindslist.length > 0) {
           for (var i = 0; i < data.latestfindslist.length; i++) {
              var find = data.latestfindslist[i];
               // <a onclick="window.selectPortalByLatLng(52.25109, 6.801604);return false" title="Pruisische Veldweg 11I, 7552 AA Hengelo, The Netherlands" href="/intel?ll=52.25109,6.801604&amp;z=17&amp;pll=52.25109,6.801604" class="help">1950's Art Hengelo</a>
               returnValue += '<div class="logitem">'+ find.timestamp.substring(0,19) + ' - <span class="'+ find.team.toLowerCase().substring(0,3) + ' nickname">' + find.huntername + '</span> found an Egg at '
                  + '<a href="' + find.portal.link + '" class="help">' + find.portal.title  + '</a></div>';
           }
        }

        return returnValue;
    }

    window.plugin.egghunt.getHintList = function(data) {
          var returnValue = '';
        if (data.hintlist != null && data.hintlist.length > 0) {
           for (var i = 0; i < data.hintlist.length; i++) {
              var hint = data.hintlist[i];
               if (hint.text == "") {
                   returnValue += '<div class="hintitem"><img src="' + hint.url.replace("http:","https:") + '=s180"></img></div>';
               } else {
                   returnValue += '<div class="hintitem">' + hint.text + '</div>';
               }
           }
        }

        return returnValue;
    }

    window.plugin.egghunt.portalSelected = function(portal) {
        var selectedPortal = window.portals[portal.selectedPortalGuid];
        if (selectedPortal !== undefined) {
            if (selectedPortal !== window.plugin.egghunt.selectedportal) {
                  window.plugin.egghunt.selectedportal = selectedPortal;
                  if (window.plugin.egghunt.isbunny) {
                      var existingLayer = window.plugin.egghunt.egglayerlist[portal.selectedPortalGuid];
                      if (existingLayer !== undefined)  {
                          selectedPortal = existingLayer;
                      }

                      var latlng = selectedPortal.getLatLng();
                      window.plugin.egghunt.drawInputPopop(selectedPortal, latlng);
                  } else {
                      window.plugin.egghunt.getUpdate(portal.selectedPortalGuid);
                  }
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
        + '</form>';

        formpopup.setContent(formContent + '</div>');
        formpopup.openOn(window.map);
    }

    window.plugin.egghunt.getUpdate = function(portalid) {
        var northWest = map.getBounds().getNorthWest();
        var southEast = map.getBounds().getSouthEast();
        var requestDate = new Date();
        window.plugin.egghunt.datarequestdate = requestDate;
        $.ajax({
            url: window.plugin.egghunt.scriptURL + '?nickname=' + window.PLAYER.nickname + '&team=' + window.PLAYER.team + ''
            + '&token=' + window.plugin.egghunt.getOrSetInstallationToken() + ''
            + '&nwlat=' +northWest.lat  + '&nwlng=' +northWest.lng + '&selat=' +southEast.lat + '&selng=' +southEast.lng + ''
            + '&portalid=' + portalid,
            type: 'GET',
            dataType: 'text',
            success: function (data, status, header) {
               window.plugin.egghunt.requesteddata = JSON.parse(data);
               window.plugin.egghunt.updateInterface(window.plugin.egghunt.requesteddata, requestDate);
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
                 //e.stopPropagation();
                 map.closePopup();
         console.log(e.currentTarget, e);
                  var targetId = $(e.target).attr('id');
                 if (targetId === undefined && !(targetId === 'hidebutton'))
                 {
                     return false;
                 }

                 var status = $(e.target).val();
         console.log(e.currentTarget, targetId);

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

               window.plugin.egghunt.initButtonControl = function() {
                L.Control.ToggleControl = L.Control.extend({
                    onAdd: function(map) {
                        var container = L.DomUtil.create('div', 'leaflet-bar eh-control');


                        this._toggleButton = this._createButton(
                          'EH', 'Tick to become a bunny',''
                           , container, this._toggleOnOff, this);

                        this._switchRole();
                        return container;
                    },

                    onRemove: function(map) {
                        // Nothing to do here
                    },

                    _createButton: function (html, title, className, container, fn, context) {
                      var link = L.DomUtil.create('a', className, container);
                     link.innerHTML = html;
                        link.href = '#';
                        link.title = title;

                        var stop = L.DomEvent.stopPropagation;

                        L.DomEvent
                            .on(link, 'click', stop)
                            .on(link, 'mousedown', stop)
                            .on(link, 'dblclick', stop)
                            .on(link, 'click', L.DomEvent.preventDefault)
                            .on(link, 'click', fn, context)
                            .on(link, 'click', this._refocusOnMap, context);

                        return link;
                    },

                    _toggleOnOff: function (e) {
                        window.plugin.egghunt.isbunny = !window.plugin.egghunt.isbunny;
                        localStorage.setItem('egghunt.bunnyenabled', window.plugin.egghunt.isbunny);
                        this._switchRole();
                    },

                    _switchRole: function () {
                        var map = this._map;

                        if (!window.plugin.egghunt.isbunny) {
                            this._toggleButton.title = 'Tick to become a bunny';
                            this._toggleButton.innerHTML = "👀";
                            window.plugin.egghunt.updateView();
                        } else {
                            this._toggleButton.title = 'Tick to become a hunter';
                            this._toggleButton.innerHTML = "🐰";
                            window.plugin.egghunt.updateView();
                        }
                    }
                });

                L.control.toggleControl = function(opts) {
                    return new L.Control.ToggleControl(opts);
                }

                L.control.toggleControl({
                    position: 'topleft'
                }).addTo(map);
            }


     window.plugin.egghunt.addStyling = function() {
      $("<style>").prop("type", "text/css").html(`

        :root {
            --easter-cyan: #adfff5;
            --easter-green: #bbffb5;
            --easter-orange: #ffcba6;
            --easter-purple: #d8c4ff;
            --easter-red: #ffb5bf;
            --easter-yellow: #fbffae;
            --panel-shade: 0px 0px 16px 2px rgba(0,0,0,0.24);
        }
        
        .plugin-egghunt-name {
            font-size: 14px;
            font-weight: bold;
            color: gold;
            opacity: 0.7;
            text-align: center;
            text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000;
            pointer-events: none;
        }
        
        #easteregghuntmain {
            background-color: darkviolet;
            border-radius:8px;
            box-shadow: var(--panel-shade);
            color: white;
            display: flex;
            flex-direction: column;
            height:280px;
            left:60px;
            position:absolute;
            top: 20px;
            width:640px;
            z-index:6000;
        }
        
        .head-container {
            display: flex;
        }
        .column-container {
            display: flex;
            flex: 1;
            padding: 8px;
        }
        
        .head {
            background-color: orange;
            color: darkviolet;
            font-family:Arial;
            font-size:18px;
            font-weight:bold;
            line-height:28px;
            padding: 8px;
            text-align:center;
        }
        .head-column {
            flex: 1;
        }
        
        .column {
            display: flex;
            flex: 1;
            flex-direction: column;
            margin: 8px;
        }
        
        .counter {
            height:160px;
            width:100%;
        }
        
        .countertitle {
            width:100%;
            height:40px;
            font-size:30px;	
        }
        
        #counterclock {
            height:60px;
            width:100%;
        }
        
        .hunterstats {
            width:100%;
            padding:4px;
        }
        
        #signedupcount, #latestsignup, .logitem, .hintitem {
            width:100%;
        }
        
        #eggshidden, #eggsfound {
            margin:2px;
        }
        
        #signedupcount, #latestsignup {
            font-size:14px;
        }
        
        #egglog {
            flex: 1;
            width:100%;
            overflow-y:auto;
            overflow-x:hidden;
        }
        
        #hintlist {
            flex: 1;
            overflow-y:auto;
            overflow-x:hidden;
        }
        
        .hintitem, .logitem {
            border-bottom: 1px solid grey;
            font-size: 12px;
            padding: 2px 0;
        }
        
        #eggsplorer {
            display: flex;
            flex: 1;
            flex-direction: column;
        }
        
        #easteregghuntmain .res {
            font-weight:bold;
        }
        
        #easteregghuntmain .enl {
            font-weight:bold;
        }
        
        .eggsplorer-content {
            display: flex;
            flex-direction: column;
            padding-bottom: 8px;
        }
     `).appendTo("head");
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
