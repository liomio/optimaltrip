var fetch = require('node-fetch')

// skyscanner api create live search session
function createSession(origin, destination, date) {
  console.log('creating live search session...')
  return fetch("https://skyscanner-skyscanner-flight-search-v1.p.mashape.com/apiservices/pricing/v1.0", {
    method: "POST",
    headers: {
      "Content-Type":"application/x-www-form-urlencoded",
      "X-Mashape-Key":"rbUMaow3mzmshKQ0oY5Gh6NTZzt6p1cJgFLjsnAFTd2gEaaEpp",
      "X-Mashape-Host":"skyscanner-skyscanner-flight-search-v1.p.mashape.com"
    },
    body: "country=US&currency=USD&locale=en-US&originPlace=" + origin + "&destinationPlace=" + destination + "&outboundDate=" + date + "&cabinClass=economy&adults=1"
  })
  .then(response => response.headers.get('location').split('/'))
}

// skyscanner api poll session results
function pollSession(key, sortType) {
  console.log('polling...')
  return fetch("https://skyscanner-skyscanner-flight-search-v1.p.mashape.com/apiservices/pricing/uk2/v1.0/" + key + "?sortType=" + sortType + "pageIndex=0&pageSize=1", {
    method: "GET",
    headers: {
      "X-Mashape-Key":"rbUMaow3mzmshKQ0oY5Gh6NTZzt6p1cJgFLjsnAFTd2gEaaEpp",
      "X-Mashape-Host":"skyscanner-skyscanner-flight-search-v1.p.mashape.com"
    }
  })
  .then(response => response)
}

// skyscanner api update session results
async function updateResults(key, sortType) {
  var ret = {}

  // set max wait time to 20 polls
  for (var i = 0; i < 100; i++) {
    var response = await pollSession(key, sortType)

    if (response.status == 304) {
      console.log(response.status)
      continue
    }

    var body = await response.json().then(body => body)
    if (body.Status == 'UpdatesPending') {
      console.log(body.Status)
      continue
    }
    
    ret = body
    break
  }

  return ret
}

async function test() {
  var sessionKey = await createSession('IAD-sky', 'PVG-sky', '2018-11-14')
  sessionKey = sessionKey[sessionKey.length-1]
  console.log(sessionKey)
  var flightInfo = await updateResults(sessionKey, 'price')
  //console.log(flightInfo)
  console.log(flightInfo.Itineraries[0].PricingOptions[0].Price)
}

test()