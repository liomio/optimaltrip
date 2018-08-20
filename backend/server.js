var express = require('express')
var router = express.Router()
var app = express()

var fetch = require('node-fetch')

// skyscanner api create live search session
function createSession(origin, destination, date) {
  //console.log('creating live search session...')
  var formattedDate = formatDate(date)
  return fetch("https://skyscanner-skyscanner-flight-search-v1.p.mashape.com/apiservices/pricing/v1.0", {
    method: "POST",
    headers: {
      "Content-Type":"application/x-www-form-urlencoded",
      "X-Mashape-Key":"rbUMaow3mzmshKQ0oY5Gh6NTZzt6p1cJgFLjsnAFTd2gEaaEpp",
      "X-Mashape-Host":"skyscanner-skyscanner-flight-search-v1.p.mashape.com"
    },
    body: "country=US&currency=USD&locale=en-US&originPlace=" + origin + "&destinationPlace=" + destination + "&outboundDate=" + formattedDate + "&cabinClass=economy&adults=1"
  })
  .then(response => response.headers.get('location').split('/'))
  .catch(error => error)
}

// skyscanner api poll session results
function pollSession(key, sortType) {
  //console.log('polling...')
  return fetch("https://skyscanner-skyscanner-flight-search-v1.p.mashape.com/apiservices/pricing/uk2/v1.0/" + key + "?sortType=" + sortType + "pageIndex=0&pageSize=1", {
    method: "GET",
    headers: {
      "X-Mashape-Key":"rbUMaow3mzmshKQ0oY5Gh6NTZzt6p1cJgFLjsnAFTd2gEaaEpp",
      "X-Mashape-Host":"skyscanner-skyscanner-flight-search-v1.p.mashape.com"
    }
  })
  .then(response => response)
  .catch(error => error)
}

// skyscanner api update session results
async function updateResults(key, sortType) {
  var ret = {}

  // set max wait time to 100 polls
  for (var i = 0; i < 100; i++) {
    var response = await pollSession(key, sortType)
    if (!response) continue

    if (response.status == 304) {
      //console.log(response.status)
      continue
    }

    var body = await response.json().then(body => body)
    if (body.Status == 'UpdatesPending') {
      //console.log(body.Status)
      continue
    }
    
    ret = body
    break
  }

  return ret
}

async function getFlightInfo(origin, destination, date, sortType) {
  var origin1 = origin.endsWith('-sky') ? origin : origin + '-sky'
  var destination1 = destination.endsWith('-sky') ? destination : destination + '-sky'

  var sessionKey = ''
  // set max tries to 10
  for (var i = 0; i < 10; i++) {
    var response = await createSession(origin1, destination1, date)
    if (!response) continue

    sessionKey = response
  }
  
  // if api cant get anything
  if (sessionKey === '') return {}
  sessionKey = sessionKey[sessionKey.length-1]
  //console.log(sessionKey)
  var flightInfo = await updateResults(sessionKey, 'price')
  //console.log(flightInfo)
  return flightInfo
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
      console.log("looking up " + key)
      // signal that api call is in progress
      savedFlights[key] = -2;
      flightData = await getFlightInfo(itinerary[i], itinerary[i+1], date, 'price');
    }

    // save flight search
    savedFlights[key] = flightData;

    // extract price
    var price = Object.keys(flightData).length == 0 ? Number.MAX_SAFE_INTEGER : flightData.Itineraries[0].PricingOptions[0].Price

    tripCost += price;
    console.log(itinerary[i] + "_" + itinerary[i+1] + ":" + Number(price).toFixed(2));
    
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

// run in parallel
// compare itineraries
async function checkItineraries(permutations, startDate, cityList, savedFlights) {
  const promises = permutations.map(itinerary => { return calculateTripCost(itinerary, Number.MAX_SAFE_INTEGER, startDate, cityList, savedFlights)});
  
  await Promise.all(promises);
  
  return promises;
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

  // get optimal path
  var savedFlights = {};
  cityList[startingCity] = 0;
  //var result = await getOptimalPath(itineraries, startDate, cityList, savedFlights);
  var prices = []
  if (cities.length > 0) prices = await checkItineraries(itineraries, startDate, cityList, savedFlights);
  // search in batches of 6
  // need to work on if there are too many since api rejects too many concurrent requests
  else {
    for (var i = 0; i < itineraries.length; i+=6) {
      batch = itineraries.slice(i, i+6)
      var batchPrices = await checkItineraries(batch, startDate, cityList, savedFlights)
      prices.push(...batchPrices)
    }
  }
  
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
          var price = Object.keys(savedFlights[hit]).length == 0 ? Number.MAX_SAFE_INTEGER : savedFlights[hit].Itineraries[0].PricingOptions[0].Price
          tripCost += price;
          tripCost = Number(tripCost);
          console.log(hit + Number(price).toFixed(2));
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
  if (cheapest == Number.MAX_SAFE_INTEGER) return { error:"No itinerary exists!" };
  
  // match price with itinerary and return
  var result = {Path:itineraries[index], Price:Number(cheapest).toFixed(2)}
  
  return result;
}

router.post('/', function(req, res) {
  processInput(req.body).then(function(result) {
    console.log(result)
    res.send(result)
  })
})

module.exports = router
