const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../public/logs');
const screenshotDir = path.join(__dirname, '../public/screenshot');
const screenshotSrc = path.join(__dirname, '../cypress', 'screenshots');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Parse package.json to get scripts
const packageJson = require('../package.json');
const commands = Object.keys(packageJson.scripts).filter((script) => script.startsWith('spec:')).sort();

// Simple in-memory queue for command execution
const commandQueue = [];
let isProcessing = false;
let executedCount = 0;
let currentCommand = null;

function processQueue() {
  if (isProcessing || commandQueue.length === 0) return;
  isProcessing = true;
  const { command, resolve, reject } = commandQueue.shift();
  currentCommand = command;
  executeCommand(command)
    .then(result => {
      isProcessing = false;
      executedCount++;
      currentCommand = null;
      resolve(result);
      processQueue();
    })
    .catch(error => {
      isProcessing = false;
      currentCommand = null;
      reject(error);
      processQueue();
    });
}

/* GET users listing. */
router.post('/execute/:command', function(req, res, next) {
  const command = req.params.command;
  if (!commands.includes(command)) {
    return res.status(400).json({ error: 'Invalid command' });
  }
  // Add to queue and process
  new Promise((resolve, reject) => {
    commandQueue.push({ command, resolve, reject });
    processQueue();
  })
    .then(result => {
      res.json({ stdout: result.stdout, stderr: result.stderr });
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

router.get('/progress', (req, res) => {
  res.json({
    queueLength: commandQueue.length,
    executedCount,
    running: isProcessing ? currentCommand : null
  });
});

function executeCommand(command) {
  ensureDirSync(logDir);
  ensureDirSync(screenshotDir);

  const logFileName = command.replace(/:/g, '_') + '.log';
  const logFile = path.join(logDir, logFileName);

  const screenshotDes = path.join(screenshotDir, command.replace(/:/g, '_'));

  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(`npm run ${command} > "${logFile}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      // Remove destination screenshot folder if it exists, then move
      exec(`rm -rf ${screenshotDes}`, (err) => {
        if (err) {
          return reject(err);
        }
        exec(`mv ${screenshotSrc} ${screenshotDes}`, (err) => {
          if (err) {
            return reject(err);
          }
          resolve({ stdout, stderr });
        });
      });
    });
  });
}

module.exports = router;
