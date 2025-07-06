const express = require('express');
const router = express.Router();
const {
  getResult,
  downloadCommandScreenshots,
  deleteCommandResult,
  deleteResults,
} = require('../controllers/result-controller');

/* GET result of executed command. */
router.get('/:command', getResult);

/* Delete result of executed command. */
router.delete('/delete', deleteCommandResult);

// Route to delete all results (logs and screenshots)
router.delete('/delete-all', deleteResults);

// Download zipped screenshots for a command
router.get('/screenshot/download/:command', downloadCommandScreenshots);

module.exports = router;
