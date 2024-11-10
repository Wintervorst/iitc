// ==UserScript==
// @id             iitc-plugin-artifacthunt@wintervorst
// @name           IITC plugin: Abaddon Artifact Hunt
// @category       Layer
// @version        0.2.10.20190524.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/artifacthunt/us/artifacthunt.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/artifacthunt/us/artifacthunt.user.js
// @description    [iitc-20190524.013370] Abaddon Artifact Hunt
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
  plugin_info.dateTimeVersion = '20190524.013370';
  plugin_info.pluginId = 'artifacthunt';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.artifacthunt = function() {};

     window.plugin.artifacthunt.scriptURL = 'https://script.google.com/macros/s/AKfycbxEuItZOQaI4ZX2wR_Wkro7b4xKaqN57zWiw4x-9hZ8j_Z0BSG5/exec';

window.plugin.artifacthunt.updateUrl = 'https://github.com/Wintervorst/iitc/raw/master/plugins/artifacthunt/us/artifacthunt.user.js';
    window.plugin.artifacthunt.pluginVersion = '0.0.4';
    window.plugin.artifacthunt.storedtokenkeyname = 'artifacthunt.installationtoken';
    window.plugin.artifacthunt.eggsplorer = {};
    window.plugin.artifacthunt.egglist = [];
    window.plugin.artifacthunt.egglayerlist = {};
    window.plugin.artifacthunt.selectedportal = {};
    window.plugin.artifacthunt.datarequestdate = '';
    window.plugin.artifacthunt.requesteddata = '';
    window.plugin.artifacthunt.isbunny = false;
    window.plugin.artifacthunt.ishunter = true;
    window.plugin.artifacthunt.huntHasStarted = false;
    window.plugin.artifacthunt.playboxStyle = {fill: true, color: 'teal', fillColor:'teal', opacity: 1, weight: 3, fillOpacity:0.20, clickable: false, interactive: false };

    var setup = function() {
        window.plugin.artifacthunt.getBunnyEnabled();

        window.plugin.artifacthunt.addStyling();
        //document.body.appendChild(window.plugin.artifacthunt.addGrass());
        //window.plugin.artifacthunt.addRabbit()

        window.plugin.artifacthunt.playboxLayer = new L.LayerGroup();
        window.plugin.artifacthunt.egglayer = new L.featureGroup();
        window.addLayerGroup('Eggs', window.plugin.artifacthunt.egglayer, true);
        window.addLayerGroup('Playbox', window.plugin.artifacthunt.playboxLayer, true);
        window.plugin.artifacthunt.egglayer.on("click", window.plugin.artifacthunt.eggClicked);

        window.plugin.artifacthunt.initControls();
        setTimeout(function() {
           // window.plugin.artifacthunt.getUpdate();
        }, 1);

        window.addHook('portalSelected',  window.plugin.artifacthunt.portalSelected);
        //map.on('zoomend', function() {  window.plugin.artifacthunt.getUpdate(); });
        map.on('moveend', function() {  window.plugin.artifacthunt.getUpdate(); });

        window.plugin.artifacthunt.drawPlaybox();
    }

    window.plugin.artifacthunt.drawPlaybox = function() {
        var path = [{"lat":41.91189063253717,"lng":-87.62635231018066},{"lat":41.91430178803837,"lng":-87.6300323009491},{"lat":41.91688848935042,"lng":-87.63113737106323},{"lat":41.91671285245554,"lng":-87.63789653778076},{"lat":41.903874083350345,"lng":-87.63720989227295},{"lat":41.903746321429416,"lng":-87.64017105102539},{"lat":41.893875940359635,"lng":-87.64004230499268},{"lat":41.893907885801035,"lng":-87.63708114624023},{"lat":41.89140012004841,"lng":-87.63705968856812},{"lat":41.89154387998115,"lng":-87.62427091598511},{"lat":41.90232495281649,"lng":-87.62429237365723}];
        //var path = [{lat:41.899241,lng:-87.631137}, {lat:41.905122,lng:-87.629833}, {lat:41.911865, lng:-87.631882}, {lat:41.903513, lng:-87.630066}];
        var region = L.geodesicPolygon(path, window.plugin.artifacthunt.playboxStyle);
        var playbox = new google.maps.Polygon({paths: path});
        window.plugin.artifacthunt.playboxLayer.addLayer(region);
    }

    window.plugin.artifacthunt.updateView = function() {
        if (window.plugin.artifacthunt.requesteddata != '')   {
            window.plugin.artifacthunt.updateInterface(window.plugin.artifacthunt.requesteddata, window.plugin.artifacthunt.datarequestdate);
        }
    }

    window.plugin.artifacthunt.getBunnyEnabled = function() {
        var stateEnabled = localStorage.getItem('artifacthunt.bunnyenabled');
        if (stateEnabled === undefined || stateEnabled === null || stateEnabled === '' || stateEnabled === "true") {
            window.plugin.artifacthunt.isbunny = true;
            localStorage.setItem('artifacthunt.bunnyenabled', true);
        } else {
            window.plugin.artifacthunt.isbunny = false;
        }
    }

     window.plugin.artifacthunt.updateInterface = function(data, requestDate) {
         if (requestDate === window.plugin.artifacthunt.datarequestdate) {
             console.log(data);
             window.plugin.artifacthunt.huntHasStarted = data.huntHasStarted;
             window.plugin.artifacthunt.egglist = data.egglist;
             window.plugin.artifacthunt.ishunter = !data.isbunny;
             if (window.plugin.artifacthunt.egglist != null) {
                 window.plugin.artifacthunt.egglayer.clearLayers();
                 for (var i = 0; i < window.plugin.artifacthunt.egglist.length; i++) {
                     window.plugin.artifacthunt.drawEgg(window.plugin.artifacthunt.egglist[i]);
                 }
             }

             if (data.isbunny) {
              window.plugin.artifacthunt.initButtonControl();
             }

             window.plugin.artifacthunt.updateEggsplorer(data);

         }
    }

    window.plugin.artifacthunt.eggIcon = L.icon({
        iconUrl: 'https://github.com/Wintervorst/iitc/raw/master/plugins/artifacthunt/assets/abaddon_chicago.png',
        iconSize:     [40, 40], // size of the icon
        iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    window.plugin.artifacthunt.drawEgg = function(egg) {
        if (egg.foundbyplayer != "" || window.plugin.artifacthunt.isbunny) {
            var markerLatLng = L.latLng(egg.lat,egg.lng);
            var icon = window.plugin.artifacthunt.eggIcon;
            if (egg.foundbyplayer != "") {
               icon.html = egg.foundbyplayer;
            } else {
               icon.html = "";
            }

            var marker = L.marker(markerLatLng, {
                icon: icon,
                data: egg,
                guid: egg.guid
            }).addTo(window.plugin.artifacthunt.egglayer);
            window.plugin.artifacthunt.egglayerlist[egg.guid] = marker;
        }
    }

    window.plugin.artifacthunt.eggClicked = function(event) {
        if (window.plugin.artifacthunt.isbunny) {
            window.plugin.artifacthunt.drawInputPopop(event.layer, L.latLng(event.layer.options.data.lat,event.layer.options.data.lng));
        }
    }

    window.plugin.artifacthunt.initControls = function() {
         var newDiv = document.createElement("div");
        newDiv.setAttribute('id', "easterartifacthuntmain");

        document.body.appendChild(newDiv);
        window.plugin.artifacthunt.eggsplorer = newDiv;

        window.plugin.artifacthunt.initFormResponse();
    }



    window.plugin.artifacthunt.updateEggsplorer = function(data) {
      var htmlContent = `
        <div class="head-container">
          <div class="head head-column head-left">Abaddon Artifact Hunt</div>
          <div class="head head-column head-center">Explorer</div>
          <div class="head head-column head-right">Hints</div>
        </div>
        <div class="column-container">
          <div class="column column-left">
            <div id="toplistinfo">
              <div class="counter" id="huntcounter">
                    ${ window.plugin.artifacthunt.drawTimerAndTopList(data) }
                <div class="hunterstats">
                  <div id="signedupcount" class="signedupcount">${data.huntercount} hunters signed up</div>
                  <div id="latestsignup" class="latestsignup">Latest signup (${window.plugin.artifacthunt.formatTimeStamp(data.latesthunter.timestamp)}) : <span class="${data.latesthunter.team.toLowerCase().substring(0,3)}">${data.latesthunter.huntername}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="column column-center">
            <div id="eggsplorer">
              <div class="eggsplorer-content collapsable">
                <div id="eggshidden">${data.eggsplorer.hidden} artifacts hidden</div>
           	    <div id="eggsfound">${data.eggsplorer.found} artifacts found</div>
              </div>
              <div class="head">Log</div>
              <div id="egglog">
                ${window.plugin.artifacthunt.getLogList(data)}
              </div>
            </div>
          </div>
          <div class="column column-right">
            <div id="hintlist">
              ${window.plugin.artifacthunt.getHintList(data)}
            </div>
          </div>
        </div>
      </div>`

      window.plugin.artifacthunt.eggsplorer.innerHTML = htmlContent
    }

    window.plugin.artifacthunt.drawTimerAndTopList = function(data) {
        var result = '';
        if (data.huntHasStarted) {
              result  += '<div class="countertitlesmall">'
        + '		     Hunt ends in <span id="counterclock" class="counterclocksmall">'
        +            window.plugin.artifacthunt.startTimer(data.enddatetime)
        + '        </span>'
        + '	       </div>'
            + '<div class="toplisthead">Toplist</div>'
            + window.plugin.artifacthunt.showTopList(data);
        } else {
        result  += '	       <div class="countertitle">'
        + '		     Hunt starts in'
        + '	       </div>'
        + '        <div id="counterclock" class="counterclock">'
        +            window.plugin.artifacthunt.startTimer(data.startdatetime)
        + '        </div>';
        }
        return result;
    }

    window.plugin.artifacthunt.showTopList = function(data) {
       var result = '<div class="toplist">' ;
      for (var i = 0; i < data.toplist.length; i++) {
          var item = data.toplist[i];
          result += '<span class="toplistitem">#'
          + (i+1)*1 + '.' + ' '

          + '<span class="nickname ' +  item.team.toLowerCase().substring(0,3) + '">' +  item.player +'</span> '
           + item.count + ' '
          + ' artifacts</span>';
      }
        result += "</div>";

        return result;

    }

    window.plugin.artifacthunt.formatTimeStamp = function(dateTime) {
     // 2019-04-12T21:57:08

        return dateTime.substring(0, 10) + ' ' + dateTime.substring(11, 19);
    }

  window.plugin.artifacthunt.startTime = 0;
   window.plugin.artifacthunt.timerRunning = false;
  window.plugin.artifacthunt.clock = null;
    window.plugin.artifacthunt.currentTimeText = '';
    window.plugin.artifacthunt.startTimer = function(time) {
        window.plugin.artifacthunt.startTime = time;

      if (!window.plugin.artifacthunt.timerRunning) {
          window.plugin.artifacthunt.timerRunning = true;
          setInterval(function(){ window.plugin.artifacthunt.updateTimeToStart(); }, 1000);
      }
      return window.plugin.artifacthunt.currentTimeText;
    }
    window.plugin.artifacthunt.updateTimeToStart = function() {
        window.plugin.artifacthunt.clock = $("#counterclock");

              var secondMultiplier = 1000;
     var minuteMultiplier = secondMultiplier * 60;
   var hourMultiplier = minuteMultiplier * 60;
   var dayMultiplier = hourMultiplier * 24;
        window.plugin.artifacthunt.startTime -= secondMultiplier;

        var diff = window.plugin.artifacthunt.startTime;
    var days = parseInt(Math.floor(diff / dayMultiplier));
    diff -= days * dayMultiplier;
    var hours = Math.floor(diff / hourMultiplier);
  diff -= hours * hourMultiplier;
  var minutes = Math.floor(diff / minuteMultiplier);
  diff -= minutes * minuteMultiplier;
  var seconds = Math.floor(diff / secondMultiplier);


   var result = days  + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds ';
        window.plugin.artifacthunt.currentTimeText = result;
     window.plugin.artifacthunt.clock.text(result);
    }

    window.plugin.artifacthunt.getLogList = function(data) {
        var returnValue = '';
        if (data.latestfindslist != null && data.latestfindslist.length > 0) {
           for (var i = 0; i < data.latestfindslist.length; i++) {
              var find = data.latestfindslist[i];
               // <a onclick="window.selectPortalByLatLng(52.25109, 6.801604);return false" title="Pruisische Veldweg 11I, 7552 AA Hengelo, The Netherlands" href="/intel?ll=52.25109,6.801604&amp;z=17&amp;pll=52.25109,6.801604" class="help">1950's Art Hengelo</a>
               returnValue += '<div class="logitem">'+ window.plugin.artifacthunt.formatTimeStamp(find.timestamp) + ' - <span class="'+ find.team.toLowerCase().substring(0,3) + ' nickname">' + find.huntername + '</span> found an Artifact</div>';
           }
        }

        return returnValue;
    }

    window.plugin.artifacthunt.getHintList = function(data) {
        var returnValue = '';
        if (data.pluginOutDated) {
            returnValue = '<div style="font-size:28px">Your plugin is outdated, you need to download a new version from <a href="' + window.plugin.artifacthunt.updateUrl + '">here</a>.</div>';
        } else if (data.hintlist != null && data.hintlist.length > 0) {
           for (var i = 0; i < data.hintlist.length; i++) {
              var hint = data.hintlist[i];
               if (hint.portalurl !== undefined) {
                   returnValue += '<a href="' + hint.portalurl + '">';
               }
               if (hint.text == "") {
                   returnValue += '<div class="hintitem"><img src="' + hint.url.replace("http:","https:") + '=s180"></img></div>';
               } else {
                   returnValue += '<div class="hintitem">' + hint.text + '</div>';
               }
                if (hint.portalurl !== undefined) {
                   returnValue += '</a>';
               }
           }
        } else if (!data.huntHasStarted) {
             returnValue = '<div style="font-size:16px">Hints will be visible as soon as the hunt starts</div>';
        }

        return returnValue;
    }

    window.plugin.artifacthunt.portalSelected = function(portal) {
        var selectedPortal = window.portals[portal.selectedPortalGuid];
        if (selectedPortal !== undefined) {
            if (selectedPortal !== window.plugin.artifacthunt.selectedportal) {
                  window.plugin.artifacthunt.selectedportal = selectedPortal;
                  if (window.plugin.artifacthunt.isbunny && !window.plugin.artifacthunt.ishunter) {
                      var existingLayer = window.plugin.artifacthunt.egglayerlist[portal.selectedPortalGuid];
                      if (existingLayer !== undefined)  {
                          selectedPortal = existingLayer;
                      }

                      var latlng = selectedPortal.getLatLng();
                      window.plugin.artifacthunt.drawInputPopop(selectedPortal, latlng);
             //     } else if (window.plugin.artifacthunt.huntHasStarted && window.plugin.artifacthunt.ishunter) {
                      } else if (window.plugin.artifacthunt.ishunter) {
                      window.plugin.artifacthunt.drawSearchPopup(portal.selectedPortalGuid);
                  }
              }
          }
    }

    window.plugin.artifacthunt.drawSearchPopup = function(guid) {
         var selectedPortal = window.plugin.artifacthunt.selectedportal;
         var latlng = window.plugin.artifacthunt.selectedportal.getLatLng();
         var formpopup = L.popup();

        formpopup.setLatLng(latlng);

       var formContent = '<div style="width:200px;height:40px;margin-top:30px;"><form id="submit-search" name="submit-search">'
                                      + '<input name="portalid" id="portalid" type="hidden" value="' + guid +  '"/>'
                                      + '<input name="submitbuttonvalue" id="submittedstate" type="hidden">'
                                      + '<button type="submit" id="searchbutton" value="search" style="clear:both; float:left; width:100%;height:30px;">Search here</button>'
                                      + '</form>';

                formpopup.setContent(formContent + '</div>');
                formpopup.openOn(window.map);
    }

    window.plugin.artifacthunt.drawInputPopop = function(portal, latlng) {
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
        + '<input name="token" id="token" type="hidden" value="' + window.plugin.artifacthunt.getOrSetInstallationToken() + '">'
        + '<input name="submitbuttonvalue" id="submittedstate" type="hidden">'
        + '<button type="submit" id="hidebutton" value="hide" style="clear:both; float:left; width:100%;height:30px;">Hide Artifact</button>'
        + '</form>';

        formpopup.setContent(formContent + '</div>');
        formpopup.openOn(window.map);
    }

    window.plugin.artifacthunt.getUpdate = function(portalid) {
        var northWest = map.getBounds().getNorthWest();
        var southEast = map.getBounds().getSouthEast();
        var requestDate = new Date();
        var portalidstring = '';
        if (portalid !== undefined) {
           portalidstring = '&portalid=' + portalid
        }
        window.plugin.artifacthunt.datarequestdate = requestDate;
        $.ajax({
            url: window.plugin.artifacthunt.scriptURL + '?nickname=' + window.PLAYER.nickname + '&team=' + window.PLAYER.team + ''
            + '&token=' + window.plugin.artifacthunt.getOrSetInstallationToken() + ''
            + '&nwlat=' +northWest.lat  + '&nwlng=' +northWest.lng + '&selat=' +southEast.lat + '&selng=' +southEast.lng + ''
            + '&version=' + window.plugin.artifacthunt.pluginVersion + ''
            + portalidstring,
            type: 'GET',
            dataType: 'text',
            success: function (data, status, header) {
               window.plugin.artifacthunt.requesteddata = JSON.parse(data);
               window.plugin.artifacthunt.updateInterface(window.plugin.artifacthunt.requesteddata, requestDate);
            },
            error: function (x, y, z) {
                console.log('Error message: ' + x + '\n' + y + '\n' + z);
            }
        });
    }

    window.plugin.artifacthunt.eggUpdated = function(data) {
           var existingLayer = window.plugin.artifacthunt.egglayerlist[data.guid];
           if (existingLayer !== undefined)  {
               window.plugin.artifacthunt.egglayer.removeLayer(existingLayer);
           }
           window.plugin.artifacthunt.drawEgg(data);

         if (window.plugin.artifacthunt.egglist != null) {
             for (var i = 0; i < window.plugin.artifacthunt.egglist.length; i++) {
                 if (window.plugin.artifacthunt.egglist[i].guid === data.guid) {
                     window.plugin.artifacthunt.egglist.splice(i, 1);
                 }
             }
         }
        window.plugin.artifacthunt.egglist.push(data);
    }

    window.plugin.artifacthunt.initFormResponse = function() {
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
             url: window.plugin.artifacthunt.scriptURL,
             type: 'POST',
             data: new FormData(e.currentTarget),
             processData: false,
             contentType: false,
             success: function (data, status, header) {
                 window.plugin.artifacthunt.eggUpdated(data);
             },
             error: function (x, y, z) {
                 console.log('Error message: ' + x + '\n' + y + '\n' + z);
             }
         });

        });

         $('body').on('submit','#submit-search', function(e) {
            e.preventDefault();
                 //e.stopPropagation();
                 map.closePopup();
               console.log(e.currentTarget, e);
                  var targetId = $(e.target).attr('id');
                 if (targetId === undefined && !(targetId === 'searchbutton'))
                 {
                     return false;
                 }

                 var portalid = $(e.target).find("#portalid").val();
             if (portalid !== undefined) {
                 window.plugin.artifacthunt.getUpdate(portalid);
             } else {
                 return false;
             }
        });
    }

        // Create a token for this installation if it did not already exist
    window.plugin.artifacthunt.getOrSetInstallationToken = function() {
        var token = localStorage.getItem(window.plugin.artifacthunt.storedtokenkeyname);
        if (token === undefined || token === null) {
            token = window.plugin.artifacthunt.generateToken();
            localStorage.setItem(window.plugin.artifacthunt.storedtokenkeyname, token);
        }
        return token;
    }

    window.plugin.artifacthunt.generateToken = function() {
        // Source: https://gist.github.com/jed/982883
        var guid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )

        return guid.replace(/-/g,"");
    }

    window.plugin.artifacthunt.initButtonControlInitialized = false;
               window.plugin.artifacthunt.initButtonControl = function() {


                   if (!window.plugin.artifacthunt.initButtonControlInitialized) {
                      window.plugin.artifacthunt.initButtonControlInitialized = true;
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
                        window.plugin.artifacthunt.isbunny = !window.plugin.artifacthunt.isbunny;
                        localStorage.setItem('artifacthunt.bunnyenabled', window.plugin.artifacthunt.isbunny);
                        this._switchRole();
                    },

                    _switchRole: function () {
                        var map = this._map;

                        if (!window.plugin.artifacthunt.isbunny) {
                            this._toggleButton.title = 'Tick to become a bunny';
                            this._toggleButton.innerHTML = "👀";
                            window.plugin.artifacthunt.updateView();
                        } else {
                            this._toggleButton.title = 'Tick to become a hunter';
                            this._toggleButton.innerHTML = "🐰";
                            window.plugin.artifacthunt.updateView();
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
            }


     window.plugin.artifacthunt.addStyling = function() {
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

        .plugin-artifacthunt-name {
            font-size: 14px;
            font-weight: bold;
            color: gold;
            opacity: 0.7;
            text-align: center;
            text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000;
            pointer-events: none;
        }

        #easterartifacthuntmain {
            background-color: #006EA1;
            border-radius: 12px 12px 8px 8px;
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
            height: calc(100% - 60px);
            padding: 8px;
        }

        .head {
            background-color: #00AFD5;
            color: #006EA1;
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

        .head-left {
            border-radius: 8px 0 0;
        }

        .head-right {
            border-radius: 0 8px 0 0;
        }

        .column {
            display: flex;
            flex: 1;
            flex-direction: column;
            margin: 8px;
        }

        .column-right {
  height:200px;
 }

        .counter {
            display: flex;
            flex: 1;
            flex-direction: column;
        }

        .countertitle {
            height:40px;
            font-size:30px;
        }

        .counterclock {
            height:60px;
        }

       .countertitlesmall {
            font-size:12px;
        }

        .counterclocksmall {
            font-size:12px;
        }

        .toplisthead {
            height:20px;
            font-size:16px;
            text-align:center;
        }

        .toplist {
            height: 86px;
            overflow-y:auto;
        }

        .toplistitem {
            width:100%;
            float:left;
        }

        .hunterstats {
            width: 100%;
            padding: 4px 0;
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
max-height:122px;
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

        #easterartifacthuntmain .res {
            font-weight:bold;
        }

        #easterartifacthuntmain .enl {
            font-weight:bold;
        }

        .eggsplorer-content {
            display: flex;
            flex-direction: column;
            padding-bottom: 8px;
        }
     `).appendTo("head");
     }

     window.plugin.artifacthunt.easeOut = (progress, power = 4) => 1 - (1 - progress) ** power
     window.plugin.artifacthunt.easeIn = (progress, power = 4) => progress ** power

     window.plugin.artifacthunt.tween = ({ from = 0, to = 1, duration = 220, ease = window.plugin.artifacthunt.easeOut, onUpdate} = {}) => {
         const delta = to - from
         const startTime = performance.now()

         const update = timestamp => {
             const elapsed = timestamp - startTime
             const progress = Math.max(Math.min(elapsed / duration, 1), 0)
             const latest = from + ease(progress) * delta

             if (onUpdate) onUpdate(latest)

             if (progress < 1) {
                 requestAnimationFrame(update)
             }
         }

         requestAnimationFrame(update)
     }

     window.plugin.artifacthunt.addGrass = () => {
         const amountOfGrass = Math.floor(window.innerWidth / 40)
         const grassLayer = document.createElement('div')

         grassLayer.classList.add('grass-layer')
         grassLayer.style = `
           height: 100%;
           left: 0;
           pointer-events: none;
           position: absolute;
           top: 0;
           width: 100%;
           z-index: 2999;
         `

         const addPieces = () => {
             for (let i = 0; i < amountOfGrass; i++) {
             const pieceOfGrass = document.createElement('img')
             pieceOfGrass.src = 'https://github.com/Wintervorst/iitc/raw/master/plugins/artifacthunt/assets/grass.svg?sanitize=true'
             pieceOfGrass.style = `
               position: absolute;
               bottom: 0;
               left: ${Math.random() * window.innerWidth}px;
               width: ${Math.random() * 160 + 40}px;
             `
             grassLayer.appendChild(pieceOfGrass)
            }
         }

         addPieces()

         return grassLayer
     }

     window.plugin.artifacthunt.addRabbit = () => {
         const timeAtStart = performance.now()
         const appearanceVariance = 10000
         const minimumTimeToNextAppearance = 5000

         const nextAppearanceRoll = timestamp => timestamp + Math.random() * appearanceVariance + minimumTimeToNextAppearance
         let nextRabbitAppearance = nextAppearanceRoll(timeAtStart)

         const addRabbitLayer = () => {
             const rabbitLayer = document.createElement('div')
             rabbitLayer.classList.add('rabbit-layer')
             rabbitLayer.style = `
               height: 100%;
               left: 0;
               pointer-events: none;
               position: absolute;
               top: 0;
               width: 100%;
               z-index: 9999;
             `
             document.body.appendChild(rabbitLayer)
         }

         const showRabbit = () => {
             const appearedAt = performance.now()
             const appearanceDuration = 1000
             const rabbitWidth = 100

             const rabbit = document.createElement('img')
             rabbit.classList.add('rabbit')
             rabbit.src = 'https://github.com/Wintervorst/iitc/raw/master/plugins/artifacthunt/assets/rabbit.svg?sanitize=true'
             rabbit.style = `
               bottom: -100px;
               height: 100px;
               left: ${Math.max(Math.random() * window.innerWidth - rabbitWidth, 0)}px;
               position: absolute;
               width: ${rabbitWidth}px;
             `
             const rabbitLayer = document.querySelector('.rabbit-layer')
             rabbitLayer.appendChild(rabbit)
             const rabbitToRemove = document.querySelector('.rabbit')

             const moveRabbitUp = callback => {
                window.plugin.artifacthunt.tween({
                    from: 0,
                    to: 100,
                    duration: appearanceDuration / 2,
                    onUpdate: v => {
                        rabbitToRemove.style.transform = `translateY(${-v}px) translateX(${100 - v}px)`
                        if (v === 100) {
                            callback()
                        }
                    }

                    }
                )
             }

             const moveRabbitDown = () => {
                window.plugin.artifacthunt.tween({
                    from: 100,
                    to: 0,
                    ease: window.plugin.artifacthunt.easeIn,
                    duration: appearanceDuration / 2,
                    onUpdate: v => {
                        rabbitToRemove.style.transform = `translateY(${-v}px) translateX(${v - 100}px)` }
                    }
                )
             }

             moveRabbitUp(moveRabbitDown)


             const removeTimer = timestamp => {

                 if (timestamp > appearedAt + appearanceDuration) {
                     rabbitLayer.removeChild(rabbitToRemove)
                     return
                 }
                 requestAnimationFrame(removeTimer)
             }

             requestAnimationFrame(removeTimer)
         }

         const appearanceTimer = timestamp => {

            if (timestamp > nextRabbitAppearance) {
                showRabbit()
                nextRabbitAppearance = nextAppearanceRoll(timestamp)
            }

            requestAnimationFrame(appearanceTimer)
         }

         addRabbitLayer()
         requestAnimationFrame(appearanceTimer)
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
