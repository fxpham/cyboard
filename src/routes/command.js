const express = require('express');
const router = express.Router();
const {
  getCommands,
  executeCommand,
  cancelCommand,
  openCypress,
} = require('../controllers/command-controller');

router.get('/', getCommands);

router.post('/cancel', cancelCommand);

router.post('/execute', executeCommand);

router.get('/execute/cypress', openCypress);

module.exports = router;
