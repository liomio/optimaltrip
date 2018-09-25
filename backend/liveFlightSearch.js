var fetch = require('node-fetch')

module.exports = {
    // skyscanner api create live search session
    createSession: function(origin, destination, date) {
      //console.log('creating live search session...')
      var formattedDate = module.exports.formatDate(date)
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
    },

    // skyscanner api poll session results
    pollSession: function(key, sortType) {
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
    },

    // skyscanner api update session results
    updateResults: async function(key, sortType) {
      var ret = {}

      // set max wait time to 100 polls
      for (var i = 0; i < 100; i++) {
        var response = await module.exports.pollSession(key, sortType)
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
    },

    getFlightInfo: async function(origin, destination, date, sortType) {
      var origin1 = origin.endsWith('-sky') ? origin : origin + '-sky'
      var destination1 = destination.endsWith('-sky') ? destination : destination + '-sky'

      var sessionKey = ''
      // set max tries to 10
      for (var i = 0; i < 10; i++) {
        var response = await module.exports.createSession(origin1, destination1, date)
        if (!response) continue

        sessionKey = response
      }
      
      // if api cant get anything
      if (sessionKey === '') return {}
      sessionKey = sessionKey[sessionKey.length-1]
      //console.log(sessionKey)
      var flightInfo = await module.exports.updateResults(sessionKey, 'price')
      //console.log(flightInfo)
      return flightInfo
    },

    // format date to YYYY-MM-DD
    formatDate: function(date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    },

    // get new date
    nextDate: function(oldDate, days) {
      var newDate = new Date(oldDate.setDate(oldDate.getDate() + days));
      return newDate;
    },

    // calculates cost for an itinerary
    calculateTripCost: async function(itinerary, currMinCost, startDate, cityList, savedFlights) {
      var date = new Date(startDate);
      var tripCost = 0;
      // array to hold cache hits that havent been processed
      var cacheHits = [];
      for (var i = 0; i < itinerary.length - 1; i++) {
        // fetch date of next flight in itinerary
        date = module.exports.nextDate(date, cityList[itinerary[i]])

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
          flightData = await module.exports.getFlightInfo(itinerary[i], itinerary[i+1], date, 'price');
        }

        // save flight search
        savedFlights[key] = flightData;

        // extract price
        var price = Number.MAX_SAFE_INTEGER
        if (flightData.hasOwnProperty('Itineraries') && flightData.Itineraries.length > 0) {
          if (flightData.Itineraries[0].hasOwnProperty('PricingOptions') && flightData.Itineraries[0].PricingOptions.length > 0) {
            price = flightData.Itineraries[0].PricingOptions[0].Price
          }
        }

        tripCost += price;
        console.log(itinerary[i] + "_" + itinerary[i+1] + ":" + Number(price).toFixed(2));
        
        // stop if trip cost exceeds current trip cost
        if (tripCost >= currMinCost) return currMinCost;
      }
        
      if (cacheHits.length != 0) return {cost:tripCost, unprocessed:cacheHits}

      return Number(tripCost);
    }
}
