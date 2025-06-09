const CommandService = require('../services/command');
const commandService = new CommandService();

exports.getSpecCommands = (req, res) => {
  res.json(commandService.getSpecCommands())
};

exports.getExecutedCommands = (req, res) => {
  res.json(commandService.getExecutedCommands())
};

exports.executeCommand = (req, res) => {
  const command = req.params.command;
  if (!commandService.getSpecCommands().includes(command)) {
    return res.status(400).json({ error: 'Invalid command' });
  }
  // Add to queue and process
  new Promise((resolve, reject) => {
    commandService.commandQueue.push({ command, resolve, reject });
    commandService.processQueue();
  }).then(result => {
    res.json({ stdout: result.stdout, stderr: result.stderr });
  }).catch(error => {
    res.status(500).json({ error: error.message });
  });
};

exports.getProgressInfo = (req, res) => {
  return res.json(commandService.progressInfo());
}
