const express = require('express');
const router = express.Router();
const {
  getResult,
  getCommandLog,
  getCommandScreenshots,
  downloadCommandScreenshots,
  deleteCommandLog,
  deleteLogs,
  deleteCommandScreenshots,
  deleteScreenshots,
  deleteResults,
} = require('../controllers/result-controller');

/* GET result of executed command. */
router.get('/:command', getResult);

/* GET result of executed command. */
router.get('/log/:command', getCommandLog);

// Get screenshots of executed command
router.get('/screenshot/:command', getCommandScreenshots);

// Download zipped screenshots for a command
router.get('/screenshot/:command/download', downloadCommandScreenshots);

// Route to delete a log file for a command
router.delete('/log/:command/delete', deleteCommandLog);

// Route to delete a log folder
router.delete('/logs/delete', deleteLogs);

// Route to delete a screenshot folder for a command
router.delete('/screenshot/:command/delete', deleteCommandScreenshots);

// Route to delete a screenshots folder
router.delete('/screenshot/delete', deleteScreenshots);

// Route to delete all results (logs and screenshots)
router.delete('/delete', deleteResults);

module.exports = router;
