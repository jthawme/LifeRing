#! /usr/bin/env node

const cli = require('./src/cli.js');
const { CLI_NAME } = require('./constants');

const [cmd, ...cmdArgs] = process.argv.slice(2);

const command = cli.getCommand(cmd);

if (!command) {
  cli.logError([`Unknown command '${ cmd }'.`, `Run '${ CLI_NAME } help' to see available commands`])
} else {
  cli.validateArguments(command, cmdArgs)
    .then(() => command.runFunction(...cmdArgs))
    .catch(err => {
      switch (err.code) {
        case 'ENOENT':
          cli.logError(err)
          break;
        default:
          cli.logError(err)
          break;
      }
    });
}
