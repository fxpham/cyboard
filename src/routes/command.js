const express = require('express');
const router = express.Router();
const {
  getCommands,
  executeCommand,
  openCypress,
} = require('../controllers/command-controller');

router.get('/', getCommands);

router.post('/execute', executeCommand);

router.get('/execute/cypress', openCypress);

module.exports = router;
