const express = require('express');
const router = express.Router();
const {
  getCommandsData,
  getSpecCommands,
  getExecutedCommands,
  getProgressInfo,
  executeCommand,
} = require('../controllers/command-controller');

router.get('/data', getCommandsData);

router.get('/specs', getSpecCommands);

router.get('/executed', getExecutedCommands);

router.post('/execute/:command', executeCommand);

router.get('/progress', getProgressInfo);

module.exports = router;
