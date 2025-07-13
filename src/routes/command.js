const express = require('express');
const router = express.Router();
const {
  getCommands,
  executeCommand,
  cancelCommand,
  stopCommand,
  openCypress,
} = require('../controllers/command-controller');

router.get('/', getCommands);

router.post('/cancel', cancelCommand);

router.post('/execute', executeCommand);

router.post('/stop', stopCommand);

router.get('/execute/cypress', openCypress);

module.exports = router;
