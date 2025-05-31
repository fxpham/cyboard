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

module.exports = router;
