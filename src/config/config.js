const path = require('path');
const resultsDir = path.join(process.cwd(), 'results');

module.exports = {
  packageJson: path.join(process.cwd(), 'package.json'),
  screenshotSrcDir: path.join(process.cwd(), 'cypress/screenshots'),
  resultsDir: resultsDir,
  logsDir: path.join(resultsDir, 'logs'),
  screenshotsDir: path.join(resultsDir, 'screenshots'),
}
