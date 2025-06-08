const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const packageJson = require(path.join(process.cwd(), 'package.json'));

/* GET home page. */
router.get('/', function(req, res, next) {
  // Get all script commands starting with 'spec:' and sort them
  let specCommands = [];
  if (packageJson.scripts) {
    specCommands = Object.keys(packageJson.scripts)
      .filter(cmd => cmd.startsWith('spec:'))
      .sort();
  }

  // Get executed commands from log files in public/logs
  const logsDir = path.join(process.cwd(), 'results/logs');
  let executedCommands = [];
  try {
    if (fs.existsSync(logsDir)) {
      executedCommands = fs.readdirSync(logsDir)
        .filter(file => file.endsWith('.log'))
        .map(file => file.replace('.log', '').replace(/_/g, ':'))
        .sort();
    }
  } catch (e) {
    // If error, leave executedCommands empty
  }

  res.render('index', { title: 'Cyboard', specCommands, executedCommands });
});

module.exports = router;
