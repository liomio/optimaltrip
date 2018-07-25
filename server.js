// reference to starting city IATA format
var startingCity = "WAS";
// list of cities IATA format with durations
var cityList = { "WAS":0, "LON":3 , "PAR":2 , "BER":4 };
// starting date
var startDate = new Date("12-12-2018");
// optimal path
var optimalPath = { "path":[], "price":Number.MAX_SAFE_INTEGER };
// saved flight searches
var savedFlights = {};

var express = require('express')
var app = express()

app.get('/', function(req, res) {
    res.send('Hello World')
})
app.listen(3000)

// TODO devise some type of index
// returns weighted price that takes the duration into consideration
function weightedCost() {
  return 0;
}

// TODO API call
// returns cheapest price JSON from FPLab Extreme Search Flight API
function getFlightData( start, end, date ) {
  return { "Total Fare":0, "time":1 };
}

// get new date
function nextDate( oldDate, days ) {
  var newDate = new Date(oldDate.setDate(oldDate.getDate() + days));
  return newDate;
}

// calculates cost for an itinerary
function calculateTripCost( itinerary, currMinCost ) {
  var date = startDate;
  var tripCost = 0;
  for ( var i = 0; i < itinerary.length - 1; i++ ) {
    // fetch date of next flight in itinerary
    date = nextDate( date, cityList[itinerary[i]] )
    
    // check to see if flight already searched for
    var key = itinerary[i] + "_" + itinerary[i+1] + "_" + date.toString();
    var flightData = ( key in savedFlights ) ? savedFlights[key] : getFlightData( itinerary[i], itinerary[i+1], date );
    
    // save flight search
    if ( !(key in savedFlights) ) savedFlights[key] = flightData;
    
    tripCost += flightData["Total Fare"];

    // stop if trip cost exceeds current trip cost
    if ( tripCost > currMinCost ) return currMinCost;
  }

  return tripCost;
}

// generate all permutations of cities list
// return optimal permutation
function permute( list, l, r ) {
  if ( l == r ) {
    // append start and end to itinerary
    var itinerary = list.slice();
    itinerary.push( startingCity );
    itinerary.unshift( startingCity );
    console.log(itinerary);

    var thisTripCost = calculateTripCost( itinerary, optimalPath["price"] );
    if ( thisTripCost != optimalPath["price"] ) {
      optimalPath["path"] = itinerary;
      optimalPath["price"] = thisTripCost;
    }
  } else {
    for ( var i = l; i < r + 1; i++ ) {
      var temp = list[l];
      list[l] = list[i];
      list[i] = temp;
      permute( list, l + 1, r );
      list[i] = list[l];
      list[l] = temp;
    }
  }
}

var cities = [ 'LON', 'PAR', 'BER' ];
permute( cities, 0, cities.length-1 );
