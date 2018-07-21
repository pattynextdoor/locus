function decodeURL() {
  var url = window.location.href;
  var query = url.substring(url.indexOf('q=') + 2);
  query = decodeURIComponent(query);
  query = query.split('+').join(' ');
  return query;
} 

function addressToCoords(address) {
  var latLong = new Object();
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    'address': address 
  }, function(results, status) {
    if (status == 'OK') {
      latLong.lat = results[0].geometry.location.lat();
      latLong.lng = results[0].geometry.location.lng();
      console.log(latLong);
      return latLong;
    }
    else {
      console.log(status);
    }
  });

  return latLong;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function plotOnboardPOIs(data, Graphic, view) {

    for(var i = 0; i < data.length; i++) {
        var lat = data[i].geo_latitude;
        var lng = data[i].geo_longitude;

        var poi= {
            type: "point",
            longitude: lng,
            latitude: lat
        };

        var poiSymbol = {
            type: "picture-marker",
            url: "https://www.iconsdb.com/icons/preview/orange/map-marker-2-xxl.png",
            width: "30px",
            height: "30px"
        };

        var poiAttributes = {
            Name: data[i].name,
            Street: data[i].street,
            Distance: data[i].distance + ' miles'
        };

        var poiPopup = {
            title: '{Name}',
            content: [{
                type: 'fields',
                fieldInfos: [{
                    fieldName: "Street",
                    visible: true
                }, {
                    fieldName: "Distance",
                    visible: true
                }]
            }]
        };

        var poiGraphic = new Graphic({
            geometry: poi,
            symbol: poiSymbol,
            attributes: poiAttributes,
            popupTemplate: poiPopup
        });

        view.graphics.add(poiGraphic);
    }

}

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "dojo/domReady!"
], 
function(Map, MapView, Graphic) {
  var map = new Map({
    basemap: "streets"
  });
  
  var view = new MapView({
    container: "viewDiv",
    zoom: 15,
    map: map
  });
  
  // Decode the search query from the URL
  var searchQuery = decodeURL();

  var coords = addressToCoords(searchQuery);
  // Use a geocoding service to get lat/long coordinates
  setTimeout(function() {
    view.center = [coords.lng, coords.lat];

    var iconPoint = {
      type: "point",
      latitude: coords.lat,
      longitude: coords.lng
    }
    
    var iconGeo = {
      type: "picture-marker",
      url: "https://image.ibb.co/fZppUJ/Marker.png",
      width: "50px",
      height: "50px"
    };

    var iconGraphic = new Graphic({
      geometry: iconPoint,
      symbol: iconGeo
    });

    view.graphics.add(iconGraphic);

    // Onboard API: Gets nearby POI's

    var pointString = 'POINT(' + coords.lng + ',' + coords.lat + ')';

    var url = 'https://search.onboard-apis.com/poisearch/v2.0.0/poi/point?'
    + $.param({
        Point: pointString,
        SearchDistance: '50',
        BusinessCategory: 'EATING - DRINKING',
        RecordLimit: '30'
    });

    var xmlHttp = new XMLHttpRequest();
    var poiData = "";
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            poiData = JSON.parse(xmlHttp.responseText);
            console.log(poiData);
            plotOnboardPOIs(poiData.response.result.package.item, Graphic, view);
        }
    }

    xmlHttp.open("GET", url, true);
    xmlHttp.setRequestHeader('apikey', '9d078487e223b1c4d54c3f3a3f628803');
    xmlHttp.setRequestHeader('accept', 'application/json');

    xmlHttp.send(null);

    // Get quality of life metrics from Teleport API 
    var teleHttp = new XMLHttpRequest();

    teleHttp.onreadystatechange = function() {
      if (teleHttp.readyState == 4 && teleHttp.status == 200) {
        qolData = JSON.parse(teleHttp.responseText);
        console.log(qolData._embedded['location:nearest-cities'][0]);
      }
    }
  
    var teleportURL = 'https://api.teleport.org/api/locations/'
    + coords.lat + ',' + coords.lng + '/';

    teleHttp.open("GET", teleportURL, true);
    teleHttp.send(null);

  }, 2000);
});