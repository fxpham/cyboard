const fs = require('fs');
const path = require('path');
const {
  packageJson,
  logsDir,
  screenshotsDir,
  screenshotSrcDir,
} = require('../config/config');
const {
  ensureDirSync,
} = require('../utils/util');
const packageJsonData = require(packageJson);

class CommandService {

  constructor() {
    this.commandQueue = [];
    /**
     * @protected
     */
    this.isProcessing = false;
    this.currentCommand = null;
  }

  getCommands() {
    const commands = this.getSpecCommands().map(cmd => {
      let stt = 'idle';
      if (this.commandQueue.find((obj => obj.command === cmd))) {
        stt = 'waiting';
      }
      else if (this.currentCommand === cmd) {
        stt = 'running';
      }
      else if (this.getExecutedCommands().includes(cmd)) {
        stt = 'executed';
      }
      return {
        name: cmd,
        type: "spec",
        status: stt,
        //startTime: ""
      }
    })
    return commands;
  }

  /**
   * Get spec: commands.
   *
   * @returns Object[]
   */
  getSpecCommands() {
    // Get all script commands starting with 'spec:' and sort them
    let specCommands = [];
    if (packageJsonData.scripts) {
      specCommands = Object.keys(packageJsonData.scripts)
        .filter(cmd => cmd.startsWith('spec:'))
        .sort();
    }
    return specCommands;
  }

  /**
   * Get executed command
   *
   * @todo Check running command.
   * @returns
   */
  getExecutedCommands() {
    let executedCommands = [];
    try {
      if (fs.existsSync(logsDir)) {
        executedCommands = fs.readdirSync(logsDir)
          .filter(file => file.endsWith('.log'))
          .map(file => file.replace('.log', '').replace('spec_', 'spec:'))
          .sort();
      }
    } catch (e) {
      // If error, leave executedCommands empty
    }
    return executedCommands;
  }

  /**
   * Cancel waiting command.
   *
   * @param {string} command
   */
  cancelCommand(command) {
    const index = this.commandQueue.findIndex(item => item.command === command);
    if (index !== -1) {
      this.commandQueue.splice(index, 1);
    }
  }

  /**
   * Execute command.
   *
   * @param {*} command
   * @returns
   */
  executeCommand(command) {
    ensureDirSync(logsDir);
    ensureDirSync(screenshotsDir);

    const logFile = path.join(logsDir, command.replace(/:/g, '_') + '.log');
    const screenshotsDesDir = path.join(screenshotsDir, command.replace(/:/g, '_'));

    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(`npm run ${command} > "${logFile}"`, (error, stdout, stderr) => {
        // Remove destination screenshot folder if it exists, then move
        exec(`rm -rf ${screenshotsDesDir}`, (err) => {
          if (err) {
            return reject(err);
          }
          exec(`cp -r ${screenshotSrcDir} ${screenshotsDesDir}`, (err) => {
            if (err) {
              return reject(err);
            }
            resolve({ stdout, stderr });
          });
        });
        if (error) {
          return reject(error);
        }
      });
    });
  }

  processQueue() {
    if (this.isProcessing || this.commandQueue.length === 0) return;
    this.isProcessing = true;
    const { command, resolve, reject } = this.commandQueue.shift();
    this.currentCommand = command;
    this.executeCommand(command)
      .then(result => {
        this.isProcessing = false;
        this.currentCommand = null;
        resolve(result);
        this.processQueue();
      })
      .catch(error => {
        this.isProcessing = false;
        this.currentCommand = null;
        reject(error);
        this.processQueue();
      });
  }

  openCypress() {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(`npx cypress open --e2e --browser electron`, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        // When Cypress is closed, resolve with stopped: true
        resolve({ stopped: true });
      });
    });
  }
}

module.exports = CommandService;
