const express = require('express');
const router = express.Router();
const {
  getCommands,
  executeCommand,
} = require('../controllers/command-controller');

router.get('/', getCommands);

router.post('/execute', executeCommand);

module.exports = router;
