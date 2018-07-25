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

var request = require('request')
var express = require('express')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = express()

app.get('/', function(req, res) {
    res.send('Hello World')
})
app.listen(3000)
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

username = 'chris.han98@gmail.com'
password = '7782F561'
creds = Base64.encode(username + ':' + password)
var options = {
	url: 'https://api-dev.fareportallabs.com/dmsfareproviderhackathon/api/v1/FareProvider/NYC/LAX/null/null/15000/USD/Jan-24-2018/Jan-27-2018/MO,TU,WE,TH,FR,SA,SU/5/0/false/false/104/22/2/2/XSearch/9d3b8dab-2792-4e4d-9afd-fcd1d3eb25c8',
    headers: {
        'Authorization': 'Basic ' + creds,
        'content-type': 'application/json',
        'accept-encoding': 'application/gzip'
    }
};
function callback(error, response, body) {
  if (!error) {
    console.log('Info: ' + body);
  }
  if(error) {
    console.log('Error: ' + error)
  }
}
console.log(creds)
console.log(request(options, callback))
console.log('after')
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
