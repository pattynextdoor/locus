particlesJS({
  "particles": {
    "number": {
      "value": 120,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": ["#fa742f", "#ff337d", "#1866ef", "#31ff93"]
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.75,
      "random": false,
      "anim": {
        "enable": true,
        "speed": 1,
        "opacity_min": 0.4,
        "sync": false
      }
    },
    "size": {
      "value": 4,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 2,
        "size_min": 1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 120,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 2
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "top-right",
      "random": false,
      "straight": true,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "repulse"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 800,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 800,
        "size": 80,
        "duration": 2,
        "opacity": 0.8,
        "speed": 3
      },
      "repulse": {
        "distance": 400,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});

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

function colorScore(el, score) {
  if (score < 4) {
    el.style.color = 'red';
  }
  else if (score > 6) {
    el.style.color = 'green';
  }
  else {
    el.style.color = '#F68657';
  }
}

function binIndex(index) {
  console.log(index);
  console.log(typeof(index));
  if (index >= 200) {
    return 0;
  }
  else if (index >= 130 && index <= 199) {
    return 2.5;
  }
  else if (index >= 95 && index <= 129) {
    return 5;
  }
  else if (index >= 75 && index <= 94) {
    return 7.5;
  }
  else {
    return 10;
  }
}

function computeScore(arcData, teleData) {
  var teleIDs = [
    "myCheck",
    "commCheck",
    "safeCheck",
    "taxCheck",
    "colCheck",
    "intCheck"
  ];

  var sum = 0;
  for (var i = 0; i < teleData.length; i++) {
    var checkBox = document.getElementById(teleIDs[i]);
    if(checkBox.checked) {
      console.log("Box is checked");
      continue;
    }
    sum += parseInt(teleData[i]);
    console.log(sum);
  }

  sum += binIndex(parseInt(arcData.averageCollegeTuition));
  sum += binIndex(parseInt(arcData.averageMilk));
  sum += binIndex(parseInt(arcData.averageAirline));
  sum += binIndex(parseInt(arcData.averageTransit));
  sum += binIndex(parseInt(arcData.averageEnt));
  sum += binIndex(parseInt(arcData.averageSports));
  sum += binIndex(parseInt(arcData.averageGas));
  sum += binIndex(parseInt(arcData.averageHealthIns));
  console.log(sum);

  return (sum / 14).toFixed(1);
}

function createDataEl(obj) {
  var vals = (Object.values(obj));

  var labels = [
    "Median Age",
    "Average Household Income",
    "Average Home Value",
    "Average College Tuition Spending Index",
    "Average Milk Spending Index",
    "Average Airline Fare Index",
    "Average Gas Spending Index",
    "Average Mass Transit Fare Index",
    "Average Recreational Spending Index",
    "Average Sporting Events Admission Index",
    "Average Health Insurance Index",
    "% of Land Developed"
  ];

  console.log(vals);
  console.log(labels);

  var mainUl = document.createElement("ul");

  for (var i = 0; i < labels.length; i++) {
    var li = document.createElement("li");
    var attrContent = document.createTextNode(labels[i] + ': ' + vals[i]);

    li.appendChild(attrContent);
    mainUl.appendChild(li);
  }

  return mainUl;

}

function chk() {
                    var checkBox = document.getElementById("myCheck");
                    var eqhide = document.getElementById("eqhide");
                    if (checkBox.checked == true){
                      eqhide.style.display = "none";
                    } else {
                      eqhide.style.display = "block";
                    }
                  }

function commchk() {
                    var checkBox2 = document.getElementById("commCheck");
                    var commhide = document.getElementById("commhide");
                    if (checkBox2.checked == true){
                      commhide.style.display = "none";
                    } else {
                      commhide.style.display = "block";
                    }
                  }

 function safechk() {
                    var checkBox3 = document.getElementById("safeCheck");
                    var safehide = document.getElementById("safehide");
                    if (checkBox3.checked == true){
                      safehide.style.display = "none";
                    } else {
                      safehide.style.display = "block";
                    }
                  }

function taxchk() {
                    var checkBox4 = document.getElementById("taxCheck");
                    var taxhide = document.getElementById("taxhide");
                    if (checkBox4.checked == true){
                      taxhide.style.display = "none";
                    } else {
                      taxhide.style.display = "block";
                    }
                  }

function colchk() {
                    var checkBox5 = document.getElementById("colCheck");
                    var colhide = document.getElementById("colhide");
                    if (checkBox5.checked == true){
                      colhide.style.display = "none";
                    } else {
                      colhide.style.display = "block";
                    }
                  }

function intchk() {
                    var checkBox6 = document.getElementById("intCheck");
                    var inthide = document.getElementById("inthide");
                    if (checkBox6.checked == true){
                      inthide.style.display = "none";
                    } else {
                      inthide.style.display = "block";
                    }
                  }

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Expand",
  "esri/layers/FeatureLayer",
  "dojo/domReady!"
], 
function(Map, MapView, Graphic, BasemapGallery, Expand, FeatureLayer) {

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
        RecordLimit: '600'
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

    var qolArr = [];

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

                var envQuality = qolData.categories[10].score_out_of_10.toFixed(2);
              
                var envEl = document.getElementById("envQuality");
                envEl.textContent = envQuality;

                colorScore(envEl, envQuality);
                qolArr.push(envQuality);

                var taxQuality = qolData.categories[12].score_out_of_10.toFixed(2);

                var taxEl = document.getElementById("taxQuality");
                taxEl.textContent = taxQuality;

                colorScore(taxEl, taxQuality);
                qolArr.push(taxQuality);

                var costLiving = qolData.categories[1].score_out_of_10.toFixed(2);

                var colEl = document.getElementById("costLiving");
                colEl.textContent = costLiving;

                colorScore(colEl, costLiving);
                qolArr.push(costLiving);

                var commute = qolData.categories[5].score_out_of_10.toFixed(2);

                var commEl = document.getElementById("commute");
                commEl.textContent = commute;

                colorScore(commEl, commute);
                qolArr.push(commute);

                var safety = qolData.categories[7].score_out_of_10.toFixed(2);

                var safeEl = document.getElementById("safety");
                safeEl.textContent = safety;

                colorScore(safeEl, safety);
                qolArr.push(safety);

                var intAccess = qolData.categories[13].score_out_of_10.toFixed(2);

                var intEl = document.getElementById("intAccess");
                intEl.textContent = intAccess;

                colorScore(intEl, intAccess);
                qolArr.push(intAccess);

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

    var arcURL = 'https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/Geoenrichment/Enrich?studyareas=[{%22address%22:{%22text%22:%22'
    + encodeURIComponent(searchQuery)
    + '%22,%22sourceCountry%22:%22US%22},%22areaType%22:%22RingBuffer%22,%22bufferUnits%22:%22esriMiles%22,%22bufferRadii%22:[5]}]&analysisvariables=[%225yearincrements.MEDAGE_CY%22,%22Wealth.AVGHINC_CY%22,%22homevalue.AVGVAL_CY%22,%22education.X11002_A%22,%22food.X1054_A%22,%20%22TravelCEX.X7003_A%22,%22transportation.X6061_A%22,%22entertainment.X9001_A%22,%22entertainment.X9008_A%22,%22transportation.X6011_A%22,%22LandscapeFacts.NLCDDevPt%22,%22HealthPersonalCareCEX.X8002_A%22]&addDerivativeVariables=index&f=pjson'
    + '&token='
    + 'VwBONi1EJ19jMcLmQ8NDby3U-mrA3nI1jqh9p1zuA0_xV-hrDrjELGJv9VR9127lUFgf34Vcv30XOGK7opAkwBAIqxrGgNx0p4BsnummljtyWmIwtOWTnCD6VqiulSKJNKFjeuxllH47PkzMSUr0HQ..';
   
    var arcHttp = new XMLHttpRequest();

    arcHttp.onreadystatechange = function() {
      if (arcHttp.readyState == 4 && arcHttp.status == 200) {
        var arcData = JSON.parse(arcHttp.responseText);
        console.log(arcData);

        arcData = arcData.results[0].value.FeatureSet[0].features[0].attributes;
        console.log(arcData);

        var arcAttributes = {
          medianAge: arcData.MEDAGE_CY,
          averageHouseholdIncome: arcData.AVGHINC_CY,
          averageHomeValue: arcData.AVGVAL_CY,
          averageCollegeTuition: arcData.X11002_A_I,
          averageMilk: arcData.X1054_A_I,
          averageAirline: arcData.X7003_A_I,
          averageTransit: arcData.X6061_A_I,
          averageEnt: arcData.X9001_A_I,
          averageSports: arcData.X9008_A_I,
          averageGas: arcData.X6011_A_I,
          averageHealthIns: arcData.X8002_A_I,
          percentDeveloped: arcData.NLCDDevPt
        };

        var score = computeScore(arcAttributes, qolArr);
        console.log(score);

        var scoreEl = document.getElementById('score');
        scoreEl.textContent = score;

        var dataEl = createDataEl(arcAttributes);

        view.popup.open({
          title: 'Area Data Indexes',
          content: dataEl,
          visible: true,
          dockOptions: {
            position: 'bottom-right'
          }
        });

        view.popup.dockEnabled = true;
      }
    }

    arcHttp.open("GET", arcURL, true);
    arcHttp.send(null);

  }, 2000);
});
