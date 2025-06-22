const CommandService = require('../services/command');
const commandService = new CommandService();

exports.getCommandsData = (req, res) => {
  res.json(commandService.getCommandsData())
};

exports.getStateCommands = (req, res) => {
  res.json(commandService.getStateCommands())
};

exports.executeCommand = (req, res) => {
  const command = req.body.command;
  if (!commandService.getSpecCommands().find(specCmd => specCmd === command)) {
    return res.status(400).json({ error: command });
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
