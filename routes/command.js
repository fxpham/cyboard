const express = require('express');
const router = express.Router();
const path = require('path');

// Parse package.json to get scripts
const packageJson = require('../package.json');
const commands = Object.keys(packageJson.scripts).filter((script) => script.startsWith('spec:')).sort();

/* GET users listing. */
router.post('/execute/:command', function(req, res, next) {
  const command = req.params.command;
  if (!commands.includes(command)) {
    return res.status(400).json({ error: 'Invalid command' });
  }
  executeCommand(command)
    .then(result => {
      res.json({ stdout: result.stdout, stderr: result.stderr });
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

function executeCommand(command) {
  const logDir = path.join(__dirname, '../public/logs');
  if (!require('fs').existsSync(logDir)) {
    require('fs').mkdirSync(logDir, { recursive: true });
  }
  const logFileName = command.replace(/:/g, '_') + '.log';
  const logFile = path.join(logDir, logFileName);
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(`npm run ${command} > "${logFile}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

module.exports = router;
