const CommandService = require('../services/command');
const commandService = new CommandService();

exports.getSpecCommands = (req, res) => {
  res.json(commandService.getSpecCommands())
};

exports.getExecutedCommands = (req, res) => {
  res.json(commandService.getExecutedCommands())
};

exports.getCommandsData = (req, res) => {
  let commands = [{ type: 'subheader', title: 'Spec commands' }].concat(
    commandService.getSpecCommands(),
    [{ type: 'divider' }, { type: 'subheader', title: 'Other commands' }],
    commandService.getOtherCommands(),
  );
  let exCommands = [];
  let executedCommands = [];
  if (commandService.commandQueue.length) {
    let queueCommands = commandService.commandQueue.map(cmd => ({
      title: cmd.command,
      value: cmd.command
    }));
    exCommands = exCommands.concat(
      [{ type: 'subheader', title: 'Command queue' }],
      queueCommands,
    )
  }
  if (commandService.currentCommand) {
    exCommands = exCommands.concat(
      [
        { type: 'subheader', title: 'Running command' },
        { title: commandService.currentCommand, value: commandService.currentCommand}
      ],
    )
  }
  if (commandService.getExecutedCommands().length) {
    executedCommands = exCommands.concat(
      [{ type: 'subheader', title: 'Executed commands' }],
      commandService.getExecutedCommands(),
    );
  }
  res.json({
    commands: commands,
    executedCommands: executedCommands,
  })
};

exports.executeCommand = (req, res) => {
  const command = req.body.command;
  if (!commandService.getSpecCommands().find(specCmd => specCmd.value === command)) {
    return res.status(400).json({ error: commandService.getSpecCommands() });
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
