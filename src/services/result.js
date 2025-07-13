const fs = require('fs');
const path = require('path');
const {
  logsDir,
  screenshotsDir,
  resultsDir,
} = require('../config/config');
const {
  scanImages,
} = require('../utils/util');

class ResultService {
  async getLog(command) {
    const logFileName = command.replace(/:/g, '_') + '.log';
    const logFile = path.join(logsDir, logFileName);
    try {
      return await fs.promises.readFile(logFile, 'utf8');
    } catch (err) {
      return false;
    }
  }

  getScreenshots(command) {
    const folderName = command.replace(/:/g, '_')
    const folder = path.join(screenshotsDir, folderName);
    return scanImages(folder);
  }

  removeLog(command) {
    const logFileName = command.replace(/:/g, '_') + '.log';
    const logFile = path.join(logsDir, logFileName);
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
      return true;
    }
    return false;
  }

  async removeScreenshots(command) {
    const folderName = command.replace(/:/g, '_');
    const folder = path.join(screenshotsDir, folderName);
    try {
      return await fs.promises.rm(folder, { recursive: true, force: true });
    } catch (error) {
      return false;
    }
  }

  async removeResults() {
    try {
      return await fs.promises.rm(resultsDir, { recursive: true, force: true });
    } catch (error) {
      return false;
    }
  }

  getCommandScreenshotDir(command) {
    return path.join(screenshotsDir, command.replace(/:/g, '_'));
  }

  getScreenshotZipName(command) {
    const folderName = command.replace(/:/g, '_');
    const folder = this.getCommandScreenshotDir(command);
    if (!fs.existsSync(folder)) {
      return false;
    }

    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const datetime = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const zipName = `${folderName}_${datetime}.zip`;
    return zipName;
  }
}

module.exports = ResultService;
