// sample frontend JSON request
var requestJSON = {
  startingCity:"SIN",
  cityList:{
    "IAD":5
  },
  startDate:"12-24-2018"
}

var path = require('path')

// Flight API authentication
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

username = 'chris.han98@gmail.com'
password = '7782F561'
creds = Base64.encode(username + ':' + password)

var fetch = require('node-fetch')

var express = require('express')
var router = express.Router()
var app = express()

// TODO devise some type of index
// returns weighted price that takes the duration into consideration
function weightedCost(flight) {
  return 0;
}

// returns cheapest price JSON from FPLab Extreme Search Flight API
function getFlightData(start, end, date) {
  return fetch("https://api-dev.fareportallabs.com/air/api/search/searchflightavailability", {
    method: "POST",
    headers: {
      "Authorization":"Basic " + creds,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      "ResponseVersion": "VERSION41",
      "FlightSearchRequest": {
        "Adults": "1",
        "ClassOfService": "ECONOMY",
        "TypeOfTrip": "ONEWAYTRIP",
        "SegmentDetails": [
          {
            "DepartureDate": formatDate(date),
            "DepartureTime": "1100",
            "Destination": end,
            "Origin": start
          }
        ]
      }
    })
  }).then(res => res.json())
}

// parse JSON and return best flight
function parseFlightData(json) {
  // data contains the different flights sorted by flight id
  var data = {};  
  
  // check if no flights
  if (json.FlightResponse.FpSearch_AirLowFaresRS == null) return {flightId:'', flightPrice:Number.MAX_SAFE_INTEGER};
  
  // sort json data by flight id
  var flightDetails = json.FlightResponse.FpSearch_AirLowFaresRS.OriginDestinationOptions.OutBoundOptions.OutBoundOption;
  for (var obj of flightDetails) {
    data[obj.Segmentid] = {SegmentDetails:obj.FlightSegment};
  }
  var priceAndDetails = json.FlightResponse.FpSearch_AirLowFaresRS.SegmentReference.RefDetails;
  for (var obj of priceAndDetails) {
    var id = obj.OutBoundOptionId[0];
    var tempObj = data[id];
    tempObj.randomDetails = obj.CNT;
    tempObj.priceDetails = obj.PTC_FareBreakdown;
    data[id] = tempObj;
  }
  
  // go through data and return best flight
  // will replace price with weightedPrice()
  var bestFlight = {flightId:'', flightPrice:Number.MAX_SAFE_INTEGER};
  for (var flight in data) {
    var price = data[flight].priceDetails.Adult.TotalAdultFare;
    if (price < bestFlight.flightPrice) {
      bestFlight.flightId = flight;
      bestFlight.flightPrice = price;
    }
  }
  
  return bestFlight;
}

// format date to YYYY-MM-DD
function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// get new date
function nextDate(oldDate, days) {
  var newDate = new Date(oldDate.setDate(oldDate.getDate() + days));
  return newDate;
}

// calculates cost for an itinerary
async function calculateTripCost(itinerary, currMinCost, startDate, cityList, savedFlights) {
  var date = new Date(startDate);
  var tripCost = 0;
  // array to hold cache hits that havent been processed
  var cacheHits = [];
  for (var i = 0; i < itinerary.length - 1; i++) {
    // fetch date of next flight in itinerary
    date = nextDate(date, cityList[itinerary[i]])

    // check to see if flight already searched for
    var key = itinerary[i] + "_" + itinerary[i+1] + "_" + date.toString();
    var flightData = (key in savedFlights) ? savedFlights[key] : -1;

    // if api call is currently being made, push to cache hits
    if (flightData == -2) {
      cacheHits.push(key);
      continue;
    }

    // if not, call API
    if (flightData == -1) {
      // signal that api call is in progress
      savedFlights[key] = -2;
      var apiData = await getFlightData(itinerary[i], itinerary[i+1], date);
      flightData = await parseFlightData(apiData);
    }

    // save flight search
    savedFlights[key] = flightData;

    tripCost += flightData.flightPrice;
    console.log(key);
    console.log(Number(tripCost).toFixed(2));
    
    // stop if trip cost exceeds current trip cost
    if (tripCost >= currMinCost) return currMinCost;
  }
    
  if (cacheHits.length != 0) return {cost:tripCost, unprocessed:cacheHits}

  return Number(tripCost);
}

// generate all permutations of cities list
// return optimal permutation
function permute(list, l, r, permutationsList, startingCity) {
  if (l == r) {
    // append start and end to itinerary
    var itinerary = list.slice();
    itinerary.push(startingCity);
    itinerary.unshift(startingCity);
    
    // add itinerary
    permutationsList.push(itinerary);
  } else {
    for (var i = l; i < r + 1; i++) {
      var temp = list[l];
      list[l] = list[i];
      list[i] = temp;
      permute(list, l + 1, r, permutationsList, startingCity);
      list[i] = list[l];
      list[l] = temp;
    }
  }
}

// fisher-yates algorithm to shuffle array
function shuffle(array) {
  var currIndex = array.length, tempValue, randIndex;

  // while there are elements to shuffle
  while (0 !== currIndex) {

    // pick remaining element
    randIndex = Math.floor(Math.random() * currIndex);
    currIndex -= 1;

    // swap with current element
    tempValue = array[currIndex];
    array[currIndex] = array[randIndex];
    array[randIndex] = tempValue;
  }
  
  return array;
}

// run in parallel
// compare itineraries
async function checkItineraries(permutations, startDate, cityList, savedFlights) {
  const promises = permutations.map(itinerary => { return calculateTripCost(itinerary, Number.MAX_SAFE_INTEGER, startDate, cityList, savedFlights)});
  
  await Promise.all(promises);
  
  return promises;
}

// use checkItinerary instead
// get optimal path from itineraries
async function getOptimalPath(permutations, startDate, cityList, savedFlights) {
  // optimal path
  var optimalPath = { "path":[], "price":Number.MAX_SAFE_INTEGER };
  
  // enumerate through itineraries
  for (var itinerary of permutations) {
    console.log(itinerary);
    var thisTripCost = await calculateTripCost(itinerary, optimalPath["price"], startDate, cityList, savedFlights);
    if (thisTripCost != optimalPath["price"]) {
      optimalPath["path"] = itinerary;
      optimalPath["price"] = thisTripCost;
    }
  }
  
  return optimalPath;
}

async function processInput(requestJSON) {
  // parse JSON
  var startingCity = requestJSON.startingCity;
  var cityList = requestJSON.cityList;
  var cities = Object.keys(cityList);
  var startDate = new Date(requestJSON.startDate);
  
  // add check for citylist
  if (cityList.hasOwnProperty(startingCity)) delete cityList[startingCity];
  
  // generate permutations
  var itineraries = [];
  permute(cities, 0, cities.length-1, itineraries, startingCity);
  
  // shuffle array to improve cache hits
  itineraries = shuffle(itineraries);

  // get optimal path
  var savedFlights = {};
  cityList[startingCity] = 0;
  //var result = await getOptimalPath(itineraries, startDate, cityList, savedFlights);
  var prices = await checkItineraries(itineraries, startDate, cityList, savedFlights);
  
  // extract min
  var cheapest = Number.MAX_SAFE_INTEGER;
  var index = 0;
  var count = 0;
  for (const promise of prices) {
    await promise.then(function(trip) {
      // process cache hits from earlier here
      if (typeof trip === 'object') {
        tripCost = trip.cost;
        cacheHits = trip.unprocessed;
 
        // get flight info from cached flight data
        for (var hit of cacheHits) {
          tripCost += savedFlights[hit].flightPrice;
          tripCost = Number(tripCost);
          console.log(hit)
          console.log(Number(tripCost).toFixed(2));
          if (tripCost >= cheapest) break;
        }

        // check against current cheapest
        if (tripCost < cheapest) {
          cheapest = tripCost;
          index = count;
        }
      } else if (trip < cheapest) {
        cheapest = trip;
        index = count;
      }
    })
    count++;
  }
   
  // check for no itinerary
  if (cheapest == Number.MAX_SAFE_INTEGER) return "No itinerary exists!";
  
  // match price with itinerary and return
  var result = {Path:itineraries[index], Price:Number(cheapest).toFixed(2)}
  
  return result;
}

router.post('/', function(req, res) {
  processInput(req.body).then(function(result) {
    console.log(result);
    res.send(result);
  })
})


module.exports = router;
