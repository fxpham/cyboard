const archiver = require('archiver');
const ResultService = require('../services/result');
const resultService = new ResultService();

exports.getResult = (req, res) => {
  // @todo check command parameter (has in command list) before executing.
  const cmd = req.params.command;
  const screenshot = resultService.getScreenshots(cmd);
  resultService.getLog(cmd).then(log => {
    if (log === false) {
      res.json({
        command: cmd,
        result: '',
        detail: '',
        screenshot: []
      });
    }
    else {
      const parts = log.split('(Run Finished)');
      res.json({
        command: cmd,
        result: parts[1] || '',
        detail: parts[0] || '',
        screenshot: screenshot
      });
    }
  });
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

exports.deleteCommandResult = (req, res) => {
  const cmd = req.body.command;
  resultService.removeLog(cmd);
  resultService.removeScreenshots(cmd).then(result => {
    if (result === false) {
      return res.json({ success: false})
    }
    return res.json({ success: true });
  })
}

exports.deleteResults = (req, res) => {
  resultService.removeResults().then(result => {
    if (result === false) {
      return res.json({ success: false})
    }
    return res.json({ success: true });
  });
}
