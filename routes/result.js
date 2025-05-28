const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

/* GET result of executed command. */
router.get('/log/:command', function(req, res, next) {
  const command = req.params.command;
  // Convert command name to log file name
  const logFileName = command.replace(/:/g, '_') + '.log';
  const logFile = path.join(__dirname, '../public/logs', logFileName);
  fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'Log file not found.' });
    }
    const result = data.split('(Run Finished)')[1];
    res.json({ result: result });
  });
});

module.exports = router;
