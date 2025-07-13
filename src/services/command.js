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
const { exec, spawn } = require('child_process');

class CommandService {

  constructor() {
    this.commandQueue = [];
    /**
     * @protected
     */
    this.isProcessing = false;
    this.currentCommand = null;
    this.currentProcess = null;
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
   * Stop the currently running command.
   */
  stopCommand() {
    if (this.currentProcess) {
      const { exec } = require('child_process');
      // this.currentProcess.kill()
      // process.kill(-this.currentProcess.pid); // kill the process group
      exec(`taskkill /PID ${this.currentProcess.pid} /T /F`);
      this.currentProcess = null;
      this.isProcessing = false;
      this.currentCommand = null;
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
    let logStream = fs.createWriteStream(logFile);

    return new Promise((resolve, reject) => {
      this.currentProcess = spawn('npm', ['run', command], {
        cwd: process.cwd(), // or your desired directory
        shell: true
      });
      // this.currentProcess.stdout.on('data', (data) => {
      //   console.log(`stdout: ${data}`)
      // })
      this.currentProcess.stdout.pipe(logStream)
      this.currentProcess.stderr.pipe(logStream)

      this.currentProcess.on('close', (code) => {
        logStream.end();
        // Copy screentshot folder to result.
        exec(`rm -rf ${screenshotsDesDir} && cp -r ${screenshotSrcDir} ${screenshotsDesDir}`, (err) => {
          if (err) {
            return reject(err);
          }
          // resolve({ stderr });
        });

        resolve({ code });
        this.currentProcess = null;
        logStream = null;
      });

      this.currentProcess.stderr.on('error', (err) => {
        logStream.end();
        reject(err);
        this.currentProcess = null;
        logStream = null;
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
