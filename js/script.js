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

function chooseIcon(category) {
  if (category == 'EATING - DRINKING') {
    return 'https://image.ibb.co/nCpQMy/restaurant.png';
  }
  else if (category == 'EDUCATION') {
    return 'https://image.ibb.co/hXwXZJ/education.png';
  }
  else if (category == 'ATTRACTIONS - RECREATION') {
    return 'https://image.ibb.co/nnMc1y/attractions.png';
  }
  else if (category == 'HEALTH CARE SERVICES') {
    return 'https://image.ibb.co/dKwzEJ/healthcare.png';
  }
  else if (category == 'SHOPPING') {
    return 'https://image.ibb.co/g6bzEJ/shopping.png';
  }
  else if (category == 'TRAVEL') {
    return 'https://image.ibb.co/fpDeEJ/travel.png';
  }
  else if (category == 'PERSONAL SERVICES') {
    return 'https://image.ibb.co/hnzguJ/store_1.png';
  }
  else {
    console.log("Error choosing icon: Invalid business category");
  }
}

function plotOnboardPOIs(data, Graphic, view) {

    for(var i = 0; i < data.length; i++) {
        var lat = data[i].geo_latitude;
        var lng = data[i].geo_longitude;

        var poi = {
            type: "point",
            longitude: lng,
            latitude: lat
        };

        var poiSymbol = {
            type: "picture-marker",
            url: chooseIcon(data[i].business_category), 
            width: "40px",
            height: "40px"
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
  "esri/widgets/BasemapGallery",
  "esri/widgets/Expand",
  "dojo/domReady!"
], 
function(Map, MapView, Graphic, BasemapGallery, Expand) {
  var map = new Map({
    basemap: "topo"
  });
  
  var view = new MapView({
    container: "viewDiv",
    zoom: 16,
    map: map
  });

  

  var basemapGallery = new BasemapGallery({
    view: view
  });

  var expand = new Expand({
    view: view,
    content: basemapGallery,
    expandIconClass: "esri-icon-basemap",
  });

  view.ui.add(expand, {
    position: "top-right"
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
      url: "https://image.ibb.co/jtFLMy/Marker.png",
      width: "100px",
      height: "100px"
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
        SearchDistance: '5',
        BusinessCategory: 'EATING - DRINKING|EDUCATION|ATTRACTIONS - RECREATION|HEALTH CARE SERVICES|SHOPPING|TRAVEL|PERSONAL SERVICES',
        RecordLimit: '50'
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
        qolCity = JSON.parse(teleHttp.responseText);
        qolCity = qolCity._embedded['location:nearest-cities'][0]._links['location:nearest-city'].href;

        var teleHttp2 = new XMLHttpRequest();
        teleHttp2.onreadystatechange = function() {
          if (teleHttp2.readyState == 4 && teleHttp2.status == 200) {
            qolData = JSON.parse(teleHttp2.responseText);
            urbanAreaLink = qolData._links["city:urban_area"].href;

            var teleHttp3 = new XMLHttpRequest();

            teleHttp3.onreadystatechange = function() {
              if (teleHttp3.readyState == 4 && teleHttp3.status == 200) {
                var qolData = (JSON.parse(teleHttp3.responseText));
                console.log(qolData.categories);

                var envQuality = qolData.categories[10].score_out_of_10;
              
                var envEl = document.getElementById("envQuality");
                envEl.textContent = envQuality;

                var taxQuality = qolData.categories[12].score_out_of_10;

                var taxEl = document.getElementById("taxQuality");
                taxEl.textContent = taxQuality;

                qolData = qolData.summary;
                var parser = new DOMParser();

                var el = parser.parseFromString(qolData, "text/html")
                console.log(el.childNodes[0].innerText);
                var teleText = el.childNodes[0].innerText;

                var teleportEl = document.getElementById('teleport');
                teleportEl.textContent = teleText;
              }
            };

            teleHttp3.open("GET", urbanAreaLink + 'scores', true);
            teleHttp3.send(null);
          }
        }
        
        teleHttp2.open("GET", qolCity, true);
        teleHttp2.send(null);

      }
    }
  
    var teleportURL = 'https://api.teleport.org/api/locations/'
    + coords.lat + ',' + coords.lng + '/';

    teleHttp.open("GET", teleportURL, true);
    teleHttp.send(null);

    var arcURL = 'http://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/Geoenrichment/Enrich?studyareas=[{%22address%22:{%22text%22:%222119%20Brookhaven%20Ave.,%20Placentia,%20CA%2092870%22,%22sourceCountry%22:%22US%22},%22areaType%22:%22RingBuffer%22,%22bufferUnits%22:%22esriMiles%22,%22bufferRadii%22:[5]}]&analysisvariables=[%225yearincrements.MEDAGE_CY%22,%22Wealth.AVGHINC_CY%22,%22homevalue.AVGVAL_CY%22,%22education.X11002_A%22,%22food.X1054_A%22,%20%22TravelCEX.X7003_A%22,%22transportation.X6061_A%22,%22entertainment.X9001_A%22,%22entertainment.X9008_A%22,%22transportation.X6011_A%22,%22LandscapeFacts.NLCDDevPt%22,%22Health.X8002_X%22]&addDerivativeVariables=index&f=pjson&token=ZxXmJKyPBLhcq2dwLYuQCbRs4y6XH54tw6vK_v2jkT7rO2rSxWseUWfzIppj8dFS3gUuTee2ZXCgFFjoTShivgLcXdbMRxM65qSDRsliBjWJPtHy1fTzIHelstbfJKNgLZkdcu7eUgDVarw6D6PPqQ..';

    var arcHttp = new XMLHttpRequest();

    arcHttp.onreadystatechange = function() {
      if (arcHttp.readyState == 4 && arcHttp.status == 200) {
        console.log(JSON.parse(arcHttp.responseText));
      }
    }

    arcHttp.open("GET", arcURL, true);
    arcHttp.send(null);

  }, 2000);
});