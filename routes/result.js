const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const scanImages = require('./scanImages');
const archiver = require('archiver');

/* GET result of executed command. */
router.get('/log/:command', function(req, res, next) {
  const command = req.params.command;
  // Convert command name to log file name
  const logFileName = command.replace(/:/g, '_') + '.log';
  const logFile = path.join(__dirname, '../public/logs', logFileName);
  fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'Log file not found.' });
    }
    const parts = data.split('(Run Finished)');
    res.json({ result: parts[1] || '', detail: parts[0] || '' });
  });
});

// Get screenshots of executed command
router.get('/screenshot/:command', (req, res, next) => {
  const command = req.params.command;
  const folderName = command.replace(/:/g, '_')
  const folder = path.join(__dirname, `../public/screenshot/${folderName}`);
  const images = scanImages(folder);
  if (images.length === 0) {
    return res.status(404).json({ error: 'No screenshots found.' });
  }
  return res.json({ images });
});

// Download zipped screenshots for a command
router.get('/screenshot/:command/download', (req, res, next) => {
  const command = req.params.command;
  const folderName = command.replace(/:/g, '_');
  const folder = path.join(__dirname, `../public/screenshot/${folderName}`);
  if (!fs.existsSync(folder)) {
    return res.status(404).json({ error: 'Screenshot folder not found.' });
  }
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const datetime = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const zipName = `${folderName}_${datetime}.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(folder, false);
  archive.on('error', err => next(err));
  archive.pipe(res);
  archive.finalize();
});

// Route to delete a log file for a command
router.delete('/log/:command/delete', (req, res) => {
  const command = req.params.command;
  const logFileName = command.replace(/:/g, '_') + '.log';
  const logFile = path.join(__dirname, '../public/logs', logFileName);
  if (!fs.existsSync(logFile)) {
    return res.status(404).json({ error: 'Log file not found.' });
  }
  fs.unlink(logFile, err => {
    if (err) return res.status(500).json({ error: 'Failed to delete log file.' });
    res.json({ success: true });
  });
});

// Route to delete a log folder
router.delete('/log/delete', (req, res) => {
  const logFolder = path.join(__dirname, '../public/logs');
  if (!fs.existsSync(logFolder)) {
    return res.status(404).json({ error: 'Logs folder not found.' });
  }
  // Recursively delete folder
  fs.rm(logFolder, { recursive: true, force: true }, err => {
    if (err) return res.status(500).json({ error: 'Failed to delete log folder.' });
    res.json({ success: true });
  });
});

// Route to delete a screenshot folder for a command
router.delete('/screenshot/:command/delete', (req, res) => {
  const command = req.params.command;
  const folderName = command.replace(/:/g, '_');
  const folder = path.join(__dirname, '../public/screenshot', folderName);
  if (!fs.existsSync(folder)) {
    return res.status(404).json({ error: 'Screenshot folder not found.' });
  }
  // Recursively delete folder
  fs.rm(folder, { recursive: true, force: true }, err => {
    if (err) return res.status(500).json({ error: 'Failed to delete screenshot folder.' });
    res.json({ success: true });
  });
});

// Route to delete a screenshot folder
router.delete('/screenshot/delete', (req, res) => {
  const screenshotFolder = path.join(__dirname, '../public/screenshot');
  if (!fs.existsSync(screenshotFolder)) {
    return res.status(404).json({ error: 'Screenshot folder not found.' });
  }
  // Recursively delete folder
  fs.rm(screenshotFolder, { recursive: true, force: true }, err => {
    if (err) return res.status(500).json({ error: 'Failed to delete screenshot folder.' });
    res.json({ success: true });
  });
});

// Route to delete all results (logs and screenshots)
router.delete('/delete', (req, res) => {
  const logsDir = path.join(__dirname, '../public/logs');
  const screenshotsDir = path.join(__dirname, '../public/screenshot');

  // Check if logs directory exists
  if (fs.existsSync(logsDir)) {
    fs.rm(logsDir, { recursive: true, force: true }, err => {
      if (err) return res.status(500).json({ error: 'Failed to delete logs folder.' });
    });
  }

  // Check if screenshots directory exists
  if (fs.existsSync(screenshotsDir)) {
    fs.rm(screenshotsDir, { recursive: true, force: true }, err => {
      if (err) return res.status(500).json({ error: 'Failed to delete screenshots folder.' });
    });
  }

  res.json({ success: true });
});

module.exports = router;
