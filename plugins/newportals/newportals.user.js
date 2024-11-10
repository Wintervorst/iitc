// ==UserScript==
// @id             iitc-plugin-newportals@wintervorst
// @name           IITC plugin: New portals
// @category       Layer
// @version        0.1.2.20190315.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/newportals/newportals.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/newportals/newportals.user.js
// @description    [iitc-20190315.013370] Highlights new portals created since previous session on a previous day. All new portals for today are marked for the entire day.
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
  plugin_info.dateTimeVersion = '20190315.013370';
  plugin_info.pluginId = 'newportals';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.newportals = function() {};

  window.plugin.newportals.portallist = [];
  window.plugin.newportals.portalguidlist = '';
  window.plugin.newportals.mapbounds;
  window.plugin.newportals.storedViewLayerList = [];
  window.plugin.newportals.viewLayerLayers = {};
  window.plugin.newportals.todayViewedViewLayerList = [];
  window.plugin.newportals.markerAndViewedViewColor = '#88CCFF';
  window.plugin.newportals.deleteEnabled = false;

  window.plugin.newportals.update = function() {
      window.plugin.newportals.mapbounds = map.getBounds();
      $.each(window.portals, function(i, portal) {
          if (window.plugin.newportals.mapbounds.contains(portal.getLatLng())) {
              window.plugin.newportals.addPortal(portal);
          }
      });

      if (map.getZoom() >= 15) {
          window.plugin.newportals.addCurrentViewboxViewed();
      }

	  window.plugin.newportals.drawMarkers();
   }

  window.plugin.newportals.inbounds = function(portalLatLng) {
      var inBounds = false;
      $.each(window.plugin.newportals.viewLayer.getLayers(), function(i, layer) {
          if (layer.getBounds().contains(portalLatLng)) {
             inBounds = true;
             return;
          }
      });

      return inBounds;
  }

   window.plugin.newportals.addPortal = function(portal) {
       var guid = portal.options.guid;
       // If the title is undefined, we are zoomed out to far to get all portals
       if (portal.options.data.title !== undefined && window.plugin.newportals.portalguidlist.indexOf(guid) === -1) {
           // Only store portals and guids for portals we want to index
           if (window.plugin.newportals.inbounds(portal.getLatLng())) {
               var toStorePortal = {'id':guid, 'lat':portal.getLatLng().lat, 'lng':portal.getLatLng().lng, 't': portal.options.data.title, 'time':new Date().toISOString() };
               window.plugin.newportals.portallist.push(toStorePortal);
               localStorage.setItem('newportals.portallist', JSON.stringify(window.plugin.newportals.portallist));
               window.plugin.newportals.portalguidlist += guid;
               localStorage.setItem('newportals.portalguidlist', window.plugin.newportals.portalguidlist);
           }
       }
   }

   window.plugin.newportals.drawMarker = function(portal) {
       var portalLatLng = L.latLng(portal.lat, portal.lng);
       if (window.plugin.newportals.inbounds(portalLatLng)) {
           if (window.plugin.newportals.mapbounds.contains(portalLatLng)) {
               var title = portal.t;
               var marker = createGenericMarker(portalLatLng, window.plugin.newportals.markerAndViewedViewColor, {
                   title: title,
                   id:portal.id
               });

               window.plugin.newportals.markerLayer.addLayer(marker);

               if (title != '') {
                   var titleMarker = L.marker(portalLatLng, {
                       icon: L.divIcon({
                           className: 'plugin-newportals-name',
                           iconAnchor: [100,5],
                           iconSize: [200,10],
                           html: title
                       })
                   });
                   window.plugin.newportals.titleLayer.addLayer(titleMarker);
               }
           }
       }
   }

   window.plugin.newportals.drawMarkers = function() {
       window.plugin.newportals.titleLayer.clearLayers();
       window.plugin.newportals.markerLayer.clearLayers();
       window.plugin.newportals.mapbounds = map.getBounds();
       if (window.plugin.newportals.portallist.length > 0) {
           for(var i = 0; i < window.plugin.newportals.portallist.length; i++) {
               var portal = window.plugin.newportals.portallist[i];
               window.plugin.newportals.drawMarker(portal);
           }
       }
   }

   window.plugin.newportals.updateportallist = function() {
       window.plugin.newportals.getStoredPortalList();
       window.plugin.newportals.getStoredPortalGuidList();
       window.plugin.newportals.archiveStoredPortalList();
   }

   window.plugin.newportals.getStoredPortalList = function() {
      var list = localStorage.getItem('newportals.portallist');
      if (list !== undefined && list !== null && list !== 'null') {
         window.plugin.newportals.portallist = JSON.parse(list);
      }
   }

   window.plugin.newportals.getStoredPortalGuidList = function() {
      var list = localStorage.getItem('newportals.portalguidlist');
      if (list !== undefined && list !== null && list !== 'null') {
         window.plugin.newportals.portalguidlist = list;
      }
   }

   window.plugin.newportals.archiveStoredPortalList = function() {
       if (window.plugin.newportals.portallist.length > 0) {
          var today = new Date().toISOString().substring(0,10);
          var todayList = [];
          for (var i = 0; i < window.plugin.newportals.portallist.length; i++) {
              var portal = window.plugin.newportals.portallist[i];
              if (today == portal.time.substring(0,10))
              {
                 todayList.push(portal);
              }
          }
          window.plugin.newportals.portallist = todayList;
          localStorage.setItem('newportals.portallist', JSON.stringify(window.plugin.newportals.portallist));
       }
   }

   window.plugin.newportals.loadViewLayers = function() {
      var list = localStorage.getItem('newportals.viewlayers');
      if (list !== undefined && list !== null && list !== 'null') {
         window.plugin.newportals.storedViewLayerList = JSON.parse(list);
      }

      window.plugin.newportals.updateViewLayerWithGuids();

      for (var i = 0; i < window.plugin.newportals.storedViewLayerList.length; i++) {
          var viewBox = window.plugin.newportals.storedViewLayerList[i];
          var rectangle = new L.rectangle(viewBox.corners, {color: "#ff7800", weight: 5, fillOpacity:0, clickable: true, 'data':viewBox.id });
          rectangle.addTo(window.plugin.newportals.viewLayer);
          window.plugin.newportals.viewLayerLayers[viewBox.id] = rectangle;
      }
   }

   // onetime conversion for backwards compatibility
   window.plugin.newportals.updateViewLayerWithGuids = function() {
       var layersUpdated = localStorage.getItem('newportals.layersupdated');
       if (layersUpdated !== "true") {
           var updatedList = [];
           for (var i = 0; i < window.plugin.newportals.storedViewLayerList.length; i++) {
               var viewBox = window.plugin.newportals.storedViewLayerList[i];
               if (viewBox.id === undefined) {
                   var updateViewBox = {'id':window.plugin.newportals.getGuid(),'corners':viewBox};
                   updatedList.push(updateViewBox);
               }
           }

           window.plugin.newportals.storedViewLayerList = updatedList;
           localStorage.setItem('newportals.viewlayers',  JSON.stringify(window.plugin.newportals.storedViewLayerList));
           localStorage.setItem('newportals.layersupdated', "true");
      }
   }

   window.plugin.newportals.getGuid = function() {
		// Source: https://gist.github.com/jed/982883
        var guid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		)
        return guid;
  }

   window.plugin.newportals.loadViewedViewLayers = function() {
       var viewedViewLayerKey = 'newportals.viewedviewlayers';
       var list = localStorage.getItem(viewedViewLayerKey);
       if (list !== undefined && list !== null && list !== 'null') {
          window.plugin.newportals.todayViewedViewLayerList = JSON.parse(list);
       }

       var today = new Date().toISOString().substring(0,10);
       var todayList = [];
       for (var i = 0; i < window.plugin.newportals.todayViewedViewLayerList.length; i++) {
           var viewed = window.plugin.newportals.todayViewedViewLayerList[i];
           if (today == viewed.time)
           {
               todayList.push(viewed);
               var rectangle = new L.rectangle(viewed.viewBox, {color: window.plugin.newportals.markerAndViewedViewColor, weight: 0, clickable: false});
               rectangle.addTo(window.plugin.newportals.viewedviewsLayer);
           }
       }
       window.plugin.newportals.todayViewedViewLayerList = todayList;
       localStorage.setItem(viewedViewLayerKey, JSON.stringify(window.plugin.newportals.todayViewedViewLayerList));
   }

    window.plugin.newportals.addCurrentViewboxViewed = function() {
        var bounds = map.getBounds();
        var boundArray = [bounds._northEast, bounds._southWest];
        var rectangle = L.rectangle(boundArray, {color: window.plugin.newportals.markerAndViewedViewColor, weight: 0, clickable: false});
        rectangle.addTo(window.plugin.newportals.viewedviewsLayer);
        var viewBox = {'viewBox': boundArray, 'time':new Date().toISOString().substring(0,10)};
        window.plugin.newportals.todayViewedViewLayerList.push(viewBox);
        localStorage.setItem('newportals.viewedviewlayers', JSON.stringify(window.plugin.newportals.todayViewedViewLayerList));
    }

    window.plugin.newportals.addCurrentView = function() {
        var bounds = map.getBounds();
        var boundArray = [bounds._northEast, bounds._southWest];
        var boxId = window.plugin.newportals.getGuid();
        var rectangle = L.rectangle(boundArray, {color: "#ff7800", weight: 20, fillColor:'#ff7800', fillOpacity:0.1, clickable: true, 'data':boxId});
        rectangle.addTo(window.plugin.newportals.viewLayer);

        window.plugin.newportals.viewLayerLayers[boxId] = rectangle;
        window.plugin.newportals.storedViewLayerList.push({'id':boxId,'corners':boundArray});
        localStorage.setItem('newportals.viewlayers', JSON.stringify(window.plugin.newportals.storedViewLayerList));
    }

     window.plugin.newportals.removeView = function(viewId) {
         for (var i = 0; i < window.plugin.newportals.storedViewLayerList.length; i++) {
               var viewBox = window.plugin.newportals.storedViewLayerList[i];
               if (viewBox.id === viewId) {
                   var existingLayer = window.plugin.newportals.viewLayerLayers[viewId];
                   window.plugin.newportals.viewLayer.removeLayer(existingLayer);
                   window.plugin.newportals.storedViewLayerList.splice(i, 1);
                   localStorage.setItem('newportals.viewlayers', JSON.stringify(window.plugin.newportals.storedViewLayerList));
                   return;
               }
           }
     }

     window.plugin.newportals.resetViewStyle = function(viewId) {
         var existingLayer = window.plugin.newportals.viewLayerLayers[viewId];
         existingLayer.setStyle({'color' : '#ff7800', 'fillOpacity':0});
     }

    window.plugin.newportals.initFormResponse = function() {
         $('body').on('click','#delete-view', function(e) {
             e.preventDefault();
             e.stopPropagation();
             map.closePopup();
             var targetId = $(e.target).attr('id');
             if (targetId === undefined && !(targetId === 'deletebutton' || targetId === 'cancelbutton' ))
             {
                 return false;
             }

             var status = $(e.target).val();             
             var viewboxid = $(e.currentTarget).find("#viewboxid").val();

             if (status === "delete") {
                 window.plugin.newportals.removeView(viewboxid);
             }
             if (status === "cancel") {
                window.plugin.newportals.resetViewStyle(viewboxid);
             }
            });
        }

     window.plugin.newportals.drawInputPopop = function(latlng, data) {
            var formpopup = L.popup();

        	formpopup.setLatLng(latlng);

    		var formContent = '<div style="width:60px;height:70px;margin-top:5px;"><form id="delete-view" name="delete-view">'
                                  + '<input name="id" id="viewboxid" type="hidden" value="' + data +  '"/>'
                                  + '<input name="submitbuttonvalue" id="submittedstate" type="hidden">'
                                  + '<button type="submit" id="deletebutton" value="delete" style="clear:both; float:left; width:100%;height:30px;">Delete</button>'
                                  + '<button type="submit" id="cancelbutton" value="cancel" style="clear:both; float:left; width:100%;height:30px;">Cancel</button>'
                                  + '</form>';

            formpopup.setContent(formContent + '</div>');
            formpopup.openOn(window.map);
       }

        window.plugin.newportals.viewLayerClicked = function(event) {
            if (window.plugin.newportals.deleteEnabled) {
                event.layer.setStyle({'color' : 'black', 'fillOpacity':0.5, 'fillColor':'red'});
                window.plugin.newportals.drawInputPopop(event.latlng, event.layer.options.data);
            } else  {
                return false;
            }
       }

         window.plugin.newportals.getDeleteEnabled = function() {
               var deleteEnabled = localStorage.getItem('newportals.deleteEnabled');
               if (deleteEnabled === undefined || deleteEnabled === null || deleteEnabled === '' || deleteEnabled === "false") {
                   window.plugin.newportals.deleteEnabled = false;
                   localStorage.setItem('newportals.deleteEnabled', false);
               } else {
                   window.plugin.newportals.deleteEnabled = true;
               }
           }

    window.plugin.newportals.initButtonControl = function() {
               L.Control.NewPortalButtons = L.Control.extend({
                   options: {
                       position: 'topleft',
                       updateableText: 'U',
                       updateableTitle: 'Zoom in to update',
                       setViewboxText: '[ ]',
                       setViewboxTitle: 'Add current view for monitoring',
                       deleteboxText: 'Del',
                       deleteboxTitle: 'Tick to enable deleting of views'
                   },

                   onAdd: function (map) {
                       var newportalName = 'leaflet-control-newportal',
                           container = L.DomUtil.create('div', newportalName + ' leaflet-bar');

                       this._map = map;

                       this._updateableButton = this._createButton(
                           this.options.updateableText, this.options.updateableTitle,
                           newportalName, container, this._updateable, this);
                       this._setViewboxButton = this._createButton(
                           this.options.setViewboxText, this.options.setViewboxTitle,
                           newportalName, container, this._setViewbox, this);
                         this._deleteButton = this._createButton(
                           this.options.deleteboxText, this.options.deleteboxTitle,
                           newportalName, container, this._toggleOnOff, this);

                       this._updateDisabled();
                       map.on('zoomend zoomlevelschange', this._updateDisabled, this);
                       this._deleteEnabled();
                       return container;
                   },

                   onRemove: function (map) {
                       map.off('zoomend zoomlevelschange', this._updateDisabled, this);
                   },

                   _updateable: function (e) {

                   },

                   _setViewbox: function (e) {
                       window.plugin.newportals.addCurrentView();
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

                   _updateDisabled: function () {
                       var map = this._map,
                           className = 'leaflet-disabled';

                       L.DomUtil.removeClass(this._updateableButton, className);
                       L.DomUtil.removeClass(this._setViewboxButton, className);

                       if (map._zoom === map.getMinZoom()) {
                           L.DomUtil.addClass(this._setViewboxButton, className);
                       }
                       if (map.getZoom() < 15) {
                           L.DomUtil.addClass(this._updateableButton, className);
                           this._updateableButton.title = 'Zoom in to allow for updating';
                       } else {
                           this._updateableButton.title = 'View is updating/updated';
                       }
                   },

                   _toggleOnOff: function (e) {
                     window.plugin.newportals.deleteEnabled = !window.plugin.newportals.deleteEnabled;
                     localStorage.setItem('newportals.deleteEnabled', window.plugin.newportals.deleteEnabled);
                     this._deleteEnabled();
                   },

                 _deleteEnabled: function () {
                     var map = this._map,
                         className = 'leaflet-disabled';

                     L.DomUtil.removeClass(this._deleteButton, className);

                     if (window.plugin.newportals.deleteEnabled) {
                          this._deleteButton.title = 'Tick to disable deleting of views';
                     } else {
                        L.DomUtil.addClass(this._deleteButton, className);
                         this._deleteButton.title = 'Tick to enable deleting of views';
                     }
                 }
               });

                var buttonControl = new L.Control.NewPortalButtons();
               buttonControl.addTo(map);
        }

 // Initialize the plugin and display new portal markers
  var setup = function() {
      $("<style>").prop("type", "text/css")
          .html(".plugin-newportals-name {\
font-size: 14px;\
font-weight: bold;\
color: gold;\
opacity: 0.7;\
text-align: center;\
text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000; \
pointer-events: none;\
}").appendTo("head");

      window.plugin.newportals.getDeleteEnabled();
      window.plugin.newportals.updateportallist();

      window.plugin.newportals.markerLayer = new L.featureGroup();
      window.plugin.newportals.titleLayer = new L.LayerGroup();
      window.plugin.newportals.viewLayer = new L.featureGroup();
      window.plugin.newportals.viewedviewsLayer = new L.LayerGroup();

      window.addLayerGroup('New portals', window.plugin.newportals.markerLayer, true);
      window.addLayerGroup('New portals - Titles', window.plugin.newportals.titleLayer, true);
      window.addLayerGroup('New portals - Indexed views', window.plugin.newportals.viewLayer, true);
      window.plugin.newportals.viewLayer.on("click", window.plugin.newportals.viewLayerClicked);
      window.plugin.newportals.initFormResponse();
      window.addLayerGroup('New portals - Today views', window.plugin.newportals.viewedviewsLayer, true);

      window.plugin.newportals.loadViewLayers();
      window.plugin.newportals.loadViewedViewLayers();

      //window.plugin.newportals.drawMarkers();

      addHook('mapDataRefreshEnd', window.plugin.newportals.update);

      window.plugin.newportals.initButtonControl();
     
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