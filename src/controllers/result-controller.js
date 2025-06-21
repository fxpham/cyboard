const archiver = require('archiver');
const ResultService = require('../services/result');
const resultService = new ResultService();

exports.getResult = (req, res) => {
  // @todo check command parameter (has in command list) before executing.
  const screenshot = resultService.getScreenshots(req.params.command);
  resultService.getLog(req.params.command).then(log => {
    const parts = log.split('(Run Finished)');
    res.json({
      result: parts[1] || '',
      detail: parts[0] || '',
      screenshot: screenshot
    });
  });
};

exports.getCommandLog = (req, res) => {
  // @todo check command parameter (has in command list) before executing.
  resultService.getLog(req.params.command).then(log => {
    const parts = log.split('(Run Finished)');
    res.json({
      result: parts[1] || '',
      detail: parts[0] || '',
    });
  });
};

exports.getCommandScreenshots = (req, res) => {
  const images = resultService.getScreenshots(req.params.command);
  if (images.length === 0) {
    return res.status(404).json({ error: 'No screenshots found.' });
  }
  return res.json({ images });
};

exports.downloadCommandScreenshots = (req, res) => {
  const folder = resultService.getCommandScreenshotDir(req.params.command);
  const zipName = resultService.getScreenshotZipName(req.params.command);
  if (!zipName) {
    return res.status(404).json({ error: 'No screenshots found for this command.' });
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(folder, false);
  archive.on('error', err => next(err));
  archive.pipe(res);
  archive.finalize();
}

exports.deleteCommandLog = (req, res) => {
  const result = resultService.removeLog(req.params.command);
  if (result) {
    return res.json({ success: result });
  }
  return res.status(404).json({ error: 'Log file not found.' });
}

exports.deleteLogs = (req, res) => {
  resultService.removeAllLogs().then(result => {
    if (result === false) {
      return res.json({ success: false})
    }
    return res.json({ success: true });
  });
}

exports.deleteCommandScreenshots = (req, res) => {
  resultService.removeScreenshots(req.params.command).then(result => {
    if (result === false) {
      return res.json({ success: false})
    }
    return res.json({ success: true });
  });
}

exports.deleteScreenshots = (req, res) => {
  resultService.removeAllScreenshots().then(result => {
    if (result === false) {
      return res.json({ success: false})
    }
    return res.json({ success: true });
  });
}

exports.deleteResults = (req, res) => {
  resultService.removeResults().then(result => {
    if (result === false) {
      return res.json({ success: false})
    }
    return res.json({ success: true });
  });
}
