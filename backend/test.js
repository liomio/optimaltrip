var express = require('express');
var router = express.Router();

// Home page route.
router.get('/test', function (req, res) {
  res.send('TEST PAGE');
})

module.exports = router;


