var express = require('express')
var router = express.Router()
var app = express()

sampleJSON = {
    startingCity:'SIN',
    cityList:{
        'IAD':4
    },
    startDate:'12-24-2018'
}

sampleCityList = {
    'IAD':4,
    'SIN':0
}

var cachedFlightSearch = require('./cachedFlightAPI')
var liveFlightSearch = require('./liveFlightSearch')

async function postRequest(requestJSON) {
    var cachedResults = await cachedFlightSearch.processInput(requestJSON)
    console.log(cachedResults)
    var cityList = requestJSON.cityList
    cityList[requestJSON.startingCity] = 0
    var liveResults = await liveFlightSearch.calculateTripCost(cachedResults.Path, Number.MAX_SAFE_INTEGER, requestJSON.startDate, cityList, {})
    console.log(liveResults)
    return {'Path':cachedResults.Path, 'Price':liveResults}
}

router.post('/', function(req, res) {
    console.log(req.body)
    postRequest(req.body).then(function(result) {
        res.send(result)
    })
})

module.exports = router
