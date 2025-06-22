const express = require('express');
const router = express.Router();
const {
  getCommandsData,
  getStateCommands,
  executeCommand,
} = require('../controllers/command-controller');

router.get('/', getCommandsData);

router.get('/state', getStateCommands);

router.post('/execute', executeCommand);

module.exports = router;
