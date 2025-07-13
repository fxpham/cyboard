const CommandService = require('../services/command');
const commandService = new CommandService();

exports.getCommands = (req, res) => {
  res.json(commandService.getCommands())
};

exports.executeCommand = (req, res) => {
  const command = req.body.command;
  if (!commandService.getSpecCommands().find(specCmd => specCmd === command)) {
    return res.status(400).json({ error: command });
  }
  // Add to queue and process, then return getCommands() data when done
  new Promise((resolve, reject) => {
    commandService.commandQueue.push({ command, resolve, reject });
    commandService.processQueue();
  }).then(result => {
    res.json(commandService.getCommands());
  }).catch(error => {
    res.json(commandService.getCommands());
    // res.status(500).json({ error: error.message });
  });
};

exports.openCypress = async (req, res) => {
  try {
    const result = await commandService.openCypress()
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelCommand = (req, res) => {
  const cmd = req.body.command;
  if (!commandService.getCommands().find(command => command.name === cmd && command.status === 'waiting')) {
    return res.status(400).json({ error: cmd });
  }
  commandService.cancelCommand(cmd);
  res.json(commandService.getCommands());
};

exports.stopCommand = (req, res) => {
  commandService.stopCommand();
  res.json(commandService.getCommands());
};
