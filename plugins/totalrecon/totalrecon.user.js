// ==UserScript==
// @id             iitc-plugin-totalrecon@wintervorst
// @name           IITC plugin: Total Recon
// @category       Highlighter
// @version        1.0.3.20181110.013370
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/totalrecon.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/totalrecon.user.js
// @description    [iitc-20181110.013370] Place markers on the map for possible candidates, submitted candidates, rejected candidates and succesful candidates.
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
  plugin_info.dateTimeVersion = '20181110.013370';
  plugin_info.pluginId = 'totalrecon';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.totalrecon = function() {};

  window.plugin.totalrecon.editmarker = {};
  window.plugin.totalrecon.isPlacingMarkers = false;
  window.plugin.totalrecon.initialized = false;
  window.plugin.totalrecon.markercollection = [];
  window.plugin.totalrecon.plottedmarkers = {};
  window.plugin.totalrecon.plottedtitles = {};
  window.plugin.totalrecon.plottedsubmitrange = {};
  window.plugin.totalrecon.layerlist = {};
  window.plugin.totalrecon.scriptURL = localStorage.getItem('totalrecon.scriptURL');
  window.plugin.totalrecon.highlight = function(data) {} // Dummy required
  window.plugin.totalrecon.setSelected = function(selected) {
    window.plugin.totalrecon.isPlacingMarkers = selected;
  }

  window.plugin.totalrecon.setSelectedLayer = function(a) {
    var selectedLayer = window.plugin.totalrecon.layerlist[a.name];
    if (a.display) {
        
        if (selectedLayer !== undefined) {
      	if (!window.map.hasLayer(selectedLayer)) {
        	  window.map.addLayer(selectedLayer);
      	}
      	if (window.map.hasLayer(selectedLayer)) {
        	window.plugin.totalrecon.drawMarkers();
      	}
      }
    } else {        
        if (selectedLayer !== undefined && (a.name === 'Total Recon - Potentials' || a.name === 'Total Recon - Submitted' || a.name === 'Total Recon - Rejected' || a.name == 'Total Recon - Accepted')) {
             for (var propertyName in window.plugin.totalrecon.plottedmarkers) {
                 var markerLayer = window.plugin.totalrecon.plottedmarkers[propertyName];
                 if (markerLayer !== undefined && markerLayer.layer === selectedLayer) {
                     window.plugin.totalrecon.removeExistingCircle(propertyName);
                     window.plugin.totalrecon.removeExistingTitle(propertyName);
                 }
             }
        }
    }
  }

  window.plugin.totalrecon.refreshData = function() {};
  window.plugin.totalrecon.refreshData.highlight = function(data) {} // Dummy required
  window.plugin.totalrecon.refreshData.setSelected = function(selected) {
	 if (selected) {
		window.plugin.totalrecon.getStoredData();
	 }
   }

  window.plugin.totalrecon.getStoredData = function() {
     $.ajax({
        url: window.plugin.totalrecon.scriptURL,
        type: 'GET',
        dataType: 'text',
        success: function (data, status, header) {
            window.plugin.totalrecon.markercollection = JSON.parse(data);
            window.plugin.totalrecon.drawMarkers();
        },
        error: function (x, y, z) {
            console.log('Error message: ' + x + '\n' + y + '\n' + z);
        }
    });
  }

  window.plugin.totalrecon.drawMarker = function(candidate) {
    if (candidate != undefined && candidate.lat != '' && candidate.lng != '') {
       if(window.plugin.totalrecon.addMarkerToLayer(candidate)) {
           window.plugin.totalrecon.addTitleToLayer(candidate);
           window.plugin.totalrecon.addCircleToLayer(candidate);
       }
    }
  }

   window.plugin.totalrecon.addCircleToLayer = function(candidate) {
       if (window.map.hasLayer(window.plugin.totalrecon.submitRangeLayer)) {
           var portalLatLng = L.latLng(candidate.lat, candidate.lng);
           window.plugin.totalrecon.drawCircle(portalLatLng, window.plugin.totalrecon.submitRangeLayer, candidate.id);
       }
   }

   window.plugin.totalrecon.removeExistingTitle = function(guid) {
       var existingTitle = window.plugin.totalrecon.plottedtitles[guid];
           if (existingTitle !== undefined) {
               window.plugin.totalrecon.titleLayer.removeLayer(existingTitle.marker);
           }
   }

    window.plugin.totalrecon.removeExistingCircle = function(guid) {
        var existingCircle = window.plugin.totalrecon.plottedsubmitrange[guid];
        if (existingCircle !== undefined) {
            window.plugin.totalrecon.submitRangeLayer.removeLayer(existingCircle.marker);
        }
   }

   window.plugin.totalrecon.addTitleToLayer = function(candidate) {
       if (window.map.hasLayer(window.plugin.totalrecon.titleLayer)) {
           window.plugin.totalrecon.removeExistingTitle(candidate.id);
           var title = candidate.title;
           if (title != '') {
               var portalLatLng = L.latLng(candidate.lat, candidate.lng);
                var titleMarker = L.marker(portalLatLng, {
                    icon: L.divIcon({
                     className: 'plugin-totalrecon-name',
                      iconAnchor: [100,5],
                        iconSize: [200,10],
                        html: title
                    })
                });
                window.plugin.totalrecon.titleLayer.addLayer(titleMarker);

                window.plugin.totalrecon.plottedtitles[candidate.id] = {'marker':titleMarker};
            }
       }
   }


  window.plugin.totalrecon.addMarkerToLayer = function(candidate) {
      var existingMarker = window.plugin.totalrecon.plottedmarkers[candidate.id];
      if (existingMarker !== undefined) {
       	 existingMarker.layer.removeLayer(existingMarker.marker);
      }

      var portalLatLng = L.latLng(candidate.lat, candidate.lng);
      var status = candidate.status;
      var title = candidate.title;
			switch(status) {
			   case 'potential':
			   case 'candidate':
				markerColor = 'grey';
				markerLayer = window.plugin.totalrecon.potentialLayer;
				break;
				case 'submitted':
				markerColor = 'orange';
				markerLayer = window.plugin.totalrecon.submittedLayer;
				break;
				case 'live':
				markerColor = 'green';
				markerLayer = window.plugin.totalrecon.acceptedLayer;
				break;
				case 'rejected':
				markerColor = 'red';
				markerLayer = window.plugin.totalrecon.rejectedLayer;
				break;
			}


     if (window.map.hasLayer(markerLayer)) {
			var marker = createGenericMarker(portalLatLng, markerColor, {
				title: title,
                id:candidate.id,
                data:candidate,
                draggable: true
			});

         marker.on('dragend', function(e) {
          var data = e.target.options.data;
             var guid = data.id;
          var latlng = marker.getLatLng();
           data.lat = latlng.lat;
           data.lng = latlng.lng;
          // window.plugin.totalrecon.drawCircle(latlng, window.plugin.totalrecon.submitRangeLayer, guid);
  	    	window.plugin.totalrecon.drawInputPopop(latlng, data);
	    });

         marker.on('dragstart', function(e) {          
          var guid = e.target.options.data.id;

          window.plugin.totalrecon.removeExistingTitle(guid);
          window.plugin.totalrecon.removeExistingCircle(guid);

	    });
			markerLayer.addLayer(marker);
         window.plugin.totalrecon.plottedmarkers[candidate.id] = {'marker':marker, 'layer':markerLayer};

         return true;
     }

     return false;
  }

  window.plugin.totalrecon.drawCircle = function(latlng, layer, guid) {
      window.plugin.totalrecon.removeExistingCircle(guid);
    // Specify the no submit circle options
    var circleOptions = {color:'black', opacity:1, fillColor:'grey', fillOpacity:0.40, weight:1, clickable:false};
    var range = 20; // Hardcoded to 20m, the universal too close for new submit range of a portal

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);
    window.plugin.totalrecon.plottedsubmitrange[guid] = {'marker':circle};
    // Add the new circle to the submitrange draw layer
    circle.addTo(layer);
  }

  window.plugin.totalrecon.clearAllLayers = function() {
	 window.plugin.totalrecon.potentialLayer.clearLayers();
	 window.plugin.totalrecon.submittedLayer.clearLayers();
	 window.plugin.totalrecon.acceptedLayer.clearLayers();
	 window.plugin.totalrecon.rejectedLayer.clearLayers();
	 window.plugin.totalrecon.titleLayer.clearLayers();
     window.plugin.totalrecon.submitRangeLayer.clearLayers();
  }

  window.plugin.totalrecon.drawMarkers = function () {
      window.plugin.totalrecon.clearAllLayers();
     if (window.plugin.totalrecon.markercollection.length > 0) {
       $.each(window.plugin.totalrecon.markercollection, function(i, candidate) {
    			window.plugin.totalrecon.drawMarker(candidate);
  	   });
     }
  }

 window.plugin.totalrecon.onClick = function (e) {
     if (window.plugin.totalrecon.isPlacingMarkers) {
       	if (window.plugin.totalrecon.editmarker != undefined) {
			      window.map.removeLayer(window.plugin.totalrecon.editmarker);
      	 };
         window.plugin.totalrecon.fireCreatedEvent(e.latlng);
     }
 };

  var form;

   window.plugin.totalrecon.fireCreatedEvent = function (latlng) {
      var marker = createGenericMarker(latlng, 'pink', {
         title: 'Place your mark!'
     	});

       window.plugin.totalrecon.editmarker = marker;
       marker.addTo(window.map);

  	   window.plugin.totalrecon.drawInputPopop(latlng);
	};


  window.plugin.totalrecon.drawInputPopop = function(latlng, markerData) {
        var formpopup = L.popup();

    		var title = '';
    		var description = ''
        var id = '';
    		var submitteddate = '';
    		var responsedate = '';
    		var lat = '';
        var lng = '';
    		var status = 'candidate';
			var imageUrl = '';

    	if (markerData !== undefined) {
          	id = markerData.id;
          	title = markerData.title;
          	description = markerData.description;
          	submitteddate = markerData.submitteddate;
          	responsedate = markerData.responsedate;
            status = markerData.status;
			if (status === 'candidate') {
				status = 'potential';
			}
			imageUrl = markerData.candidateimageurl;
			lat = markerData.lat;
            lng = markerData.lng;
        } else {
          	lat = latlng.lat;
            lng = latlng.lng;
        }

    	formpopup.setLatLng(latlng);

		var formContent = '<div style="width:200px;height:220px;"><form id="submit-to-google" name="submit-to-google-sheet">'
                              + '<select name="status" style="clear:both; float:left; width:100%">'
                              +  '<option value="potential"' + window.plugin.totalrecon.setselectedoption('potential',status)  +'>Potential</option>'
                             + '<option value="submitted"' + window.plugin.totalrecon.setselectedoption('submitted',status)  +'>Submitted</option>'
                             + '<option value="live"' + window.plugin.totalrecon.setselectedoption('live',status)  +'>Live</option>'
                             +  '<option value="rejected"' + window.plugin.totalrecon.setselectedoption('rejected',status)  +'>Rejected</option></select>'
                              + '<input name="title" style="clear:both; float:left; width:100%; height:30px;" type="text" autocomplete="off" placeholder="Title (required)" required value="' + title +  '">'
                              + '<input name="description" style="clear:both; float:left; width:100%; height:30px;" type="text" autocomplete="off" placeholder="Description" value="' + description +  '">'
                              + '<input name="submitteddate" style="clear:both; float:left; width:100%; height:30px;" type="text" autocomplete="off" placeholder="Submitted (dd-mm-jjjj)" value="' + submitteddate +  '">'
                              + '<input name="responsedate" style="clear:both; float:left; width:100%; height:30px;" type="text" autocomplete="off" placeholder="Response (dd-mm-jjjj)" value="' + responsedate +  '">'
							  + '<input name="candidateimageurl" style="clear:both; float:left; width:100%; height:30px;" type="text" autocomplete="off" placeholder="Submission image url" value="' + imageUrl +  '">'
                              + '<input name="id" type="hidden" value="' + id +  '">'
                              + '<input name="lat" type="hidden" value="' + lat +  '">'
                              + '<input name="lng" type="hidden" value="' + lng +  '">'
                              + '<input name="nickname" type="hidden" value="' + window.PLAYER.nickname + '">'
                              + '<button type="submit" style="clear:both; float:left; width:100%;height:30px;">Send</button></form>';

		if (id !== '') {
			formContent += '<a href="https://ingress.com/intel?ll='+lat+','+lng+'&z=19" style="padding:4px; float:left;">Link</a>';
		}

		if (imageUrl !== '' && imageUrl !== undefined) {
			formContent += ' <a href="' + imageUrl + '" style="padding:4px; float:right;" target="_blank">Image</a>';
		}

        formpopup.setContent(formContent + '</div>');
        formpopup.openOn(window.map);
  }

    window.plugin.totalrecon.setselectedoption = function(optionvalue, selectedvalue) {
      if (optionvalue === selectedvalue) {
       	return ' selected="selected" ';
      }
    }


  window.plugin.totalrecon.scriptUrlIsSet = function() {
    window.plugin.totalrecon.scriptURL = localStorage.getItem('totalrecon.scriptURL');

    if (window.plugin.totalrecon.scriptURL === undefined || window.plugin.totalrecon.scriptURL === null || window.plugin.totalrecon.scriptURL == '') {

		var inputDiv = document.createElement('div');
		inputDiv.innerHTML = '<form id="askforscripturl" name="askforscripturl" style="width:200px;background-color:#fff;position:fixed;left:50px;top:50px; z-index:3000">'
						  + '<label style="clear:both; float:left; width:100% padding:5px; margin:5px; color=#000" for="scripturl">Total Recon needs a script URL to work. Enter script URL below or disable the script</label>'
						  + '<input name="scripturl" id="scripturlinput" style="clear:both; float:left; width:100%" type="text" placeholder="Scripturl" required />'
						  + '<button type="submit" style="clear:both; float:left; width:100%;height:30px;">Set scripturl</button></form>';

		document.body.appendChild(inputDiv);

        $('body').on('submit','#askforscripturl', function(e) {
            console.log(e);
            e.preventDefault();
            console.log($("#scripturlinput").val());
            localStorage.setItem('totalrecon.scriptURL', $("#scripturlinput").val());
            window.location.reload();
        });

        return false;
     }
     return true;
  }

  window.plugin.totalrecon.markerClicked = function(event) {
   	 // bind data to edit form
     if (window.plugin.totalrecon.editmarker != undefined) {
			  window.map.removeLayer(window.plugin.totalrecon.editmarker);
     };
     window.plugin.totalrecon.drawInputPopop(event.layer.getLatLng(), event.layer.options.data);
  }

  // Initialize the plugin
  var setup = function() {
     if (window.plugin.totalrecon.scriptUrlIsSet()) {

        window.addPortalHighlighter('Total Recon', window.plugin.totalrecon);
		window.addPortalHighlighter('Total Recon - Refresh data', window.plugin.totalrecon.refreshData);
        window.plugin.totalrecon.potentialLayer = new L.featureGroup();
        window.plugin.totalrecon.submittedLayer = new L.featureGroup();
        window.plugin.totalrecon.rejectedLayer = new L.featureGroup();
        window.plugin.totalrecon.acceptedLayer = new L.featureGroup();
        window.plugin.totalrecon.titleLayer = new L.LayerGroup();
         window.plugin.totalrecon.submitRangeLayer = new L.LayerGroup();

        window.addLayerGroup('Total Recon - Potentials', window.plugin.totalrecon.potentialLayer, true);
        window.plugin.totalrecon.layerlist['Total Recon - Potentials'] = window.plugin.totalrecon.potentialLayer;
        window.addLayerGroup('Total Recon - Submitted', window.plugin.totalrecon.submittedLayer, true);
         window.plugin.totalrecon.layerlist['Total Recon - Submitted'] = window.plugin.totalrecon.submittedLayer;
        window.addLayerGroup('Total Recon - Rejected', window.plugin.totalrecon.rejectedLayer, true);
         window.plugin.totalrecon.layerlist['Total Recon - Rejected'] = window.plugin.totalrecon.rejectedLayer;
        window.addLayerGroup('Total Recon - Accepted', window.plugin.totalrecon.acceptedLayer, true);
         window.plugin.totalrecon.layerlist['Total Recon - Accepted'] = window.plugin.totalrecon.acceptedLayer;
        window.addLayerGroup('Total Recon - Titles', window.plugin.totalrecon.titleLayer, true);
         window.plugin.totalrecon.layerlist['Total Recon - Titles'] = window.plugin.totalrecon.titleLayer;
        window.addLayerGroup('Total Recon - Submitrange', window.plugin.totalrecon.submitRangeLayer, false);
         window.plugin.totalrecon.layerlist['Total Recon - Submitrange'] = window.plugin.totalrecon.submitRangeLayer;

        $("<style>")
            .prop("type", "text/css")
            .html(".plugin-totalrecon-name {\
		font-size: 12px;\
			font-weight: bold;\
			color: gold;\
			opacity: 0.7;\
			text-align: center;\
		text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000; \
		pointer-events: none;\
				}")
            .appendTo("head");


        $('body').on('submit','#submit-to-google', function(e) {
            console.log(e);
            e.preventDefault();
            map.closePopup();
             $.ajax({
        			url: window.plugin.totalrecon.scriptURL,
        			type: 'POST',
            	data: new FormData(e.currentTarget),
              processData: false,
        			contentType: false,
        			success: function (data, status, header) {
									window.plugin.totalrecon.drawMarker(data);
            			if (window.plugin.totalrecon.editmarker != undefined) {
			              window.map.removeLayer(window.plugin.totalrecon.editmarker);
      					  };


        			},
        		error: function (x, y, z) {
            		console.log('Error message: ' + x + '\n' + y + '\n' + z);
        		}
    					});

        });

        window.map.on('click', function(e) { window.plugin.totalrecon.onClick(e); });

       //window.map.addLayer(window.plugin.totalrecon.markerEditLayer);

   	    window.plugin.totalrecon.potentialLayer.on("click", window.plugin.totalrecon.markerClicked);
        window.plugin.totalrecon.submittedLayer.on("click", window.plugin.totalrecon.markerClicked);
        window.plugin.totalrecon.rejectedLayer.on("click", window.plugin.totalrecon.markerClicked);
        window.plugin.totalrecon.acceptedLayer.on("click", window.plugin.totalrecon.markerClicked);

        window.plugin.totalrecon.getStoredData();
        window.plugin.totalrecon.initialized = true;


         window.pluginCreateHook('displayedLayerUpdated');

         window.addHook('displayedLayerUpdated',  window.plugin.totalrecon.setSelectedLayer);
         window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;
      }

     // Overload for IITC default in order to catch the manual select/deselect event and handle it properly
      // Update layerGroups display status to window.overlayStatus and localStorage 'ingress.intelmap.layergroupdisplayed'
     window.updateDisplayedLayerGroupModified = function(name, display) {
         overlayStatus[name] = display;
         localStorage['ingress.intelmap.layergroupdisplayed'] = JSON.stringify(overlayStatus);
         runHooks('displayedLayerUpdated', {name: name, display: display});
     }
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