var express = require('express');
var router = express.Router();
const packageJson = require('../package.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Get all script commands starting with 'spec:' and sort them
  let specCommands = [];
  if (packageJson.scripts) {
    specCommands = Object.keys(packageJson.scripts)
      .filter(cmd => cmd.startsWith('spec:'))
      .sort();
  }
  res.render('index', { title: 'Express', specCommands });
});

module.exports = router;
