var express = require('express');
var router = express.Router();
var code = require('./server.js');

// Home page route.
router.get('/', function (req, res) {
    processInput(code.requestJSON);
})

module.exports = router; 
