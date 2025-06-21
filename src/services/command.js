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
    this.executedCount = 0;
    this.currentCommand = null;
  }

  getSpecCommands() {
    // Get all script commands starting with 'spec:' and sort them
    let specCommands = [];
    if (packageJsonData.scripts) {
      specCommands = Object.keys(packageJsonData.scripts)
        .filter(cmd => cmd.startsWith('spec:'))
        .sort()
        .map(cmd => ({
          title: cmd,
          value: cmd
        }));
    }
    return specCommands;
  }

  /**
   * Get custom commands not start with spec:
   * @returns []
   */
  getOtherCommands() {
    let commands = [];
    if (packageJsonData.scripts) {
      commands = Object.keys(packageJsonData.scripts)
        .filter(cmd => !cmd.startsWith('spec:'))
        .sort()
        .map(cmd => ({
          title: cmd,
          value: cmd
        }));
    }
    return commands;
  }

  getExecutedCommands() {
    let executedCommands = [];
    try {
      if (fs.existsSync(logsDir)) {
        executedCommands = fs.readdirSync(logsDir)
          .filter(file => file.endsWith('.log'))
          .map(file => file.replace('.log', '').replace(/_/g, ':'))
          .sort()
          .map(cmd => ({
            title: cmd,
            value: cmd
          }));
      }
    } catch (e) {
      // If error, leave executedCommands empty
    }
    return executedCommands;
  }

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
        this.commandQueue.length === 0 ? this.executedCount = 0 : this.executedCount++;
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

  progressInfo() {
    return {
      queueLength: this.commandQueue.length,
      executedCount: this.executedCount,
      runningCommand: this.currentCommand
    }
  }
}

module.exports = CommandService;
