const chalk = require('chalk');
const prompts = require('prompts');
const cron = require('node-cron');

const engine = require('../engine');
const { CLI_NAME } = require('../constants');
const Database = require('../model/Database');

const COMMANDS = [
  {
    label: 'Initialise',
    command: 'init',
    description: `Initialise the ${ CLI_NAME } tool`,
    runFunction: () => {
      return initalise();
    }
  },

  {
    label: 'Help',
    command: 'help',
    description: "Lists all available commands",
    runFunction: (specific = false) => {
      console.log();
      if (specific) {
        const command = getCommand(specific, COMMANDS);

        if (!command) {
          logError(`Unknown command '${ specific }'`);
        } else {
          logCommand(command, true);
        }

        return Promise.resolve();
      }

      console.log(`These are a list of available commands currently in use with '${ CLI_NAME }':`)
      COMMANDS.map(c => logCommand(c));
      console.log(`To see more info about any command, type their name after 'help'`)
      console.log(`Eg. ${ CLI_NAME } help setup`);
      console.log();
      return Promise.resolve();
    }
  },

  {
    label: 'Setup',
    command: 'setup',
    description: "Creates an interactive setup for a database",
    runFunction: () => {
      return setupQuestions()
        .then(({ name, user, hours, backup_limit }) => {
          const db = new Database(name);
          db.fill({
            user,
            hours,
            backup_limit
          });

          return db.save();
        })
        .then(data => {
          log([`Database file created for '${ data.name }'`]);
        });
    }
  },

  {
    label: 'Backup',
    command: 'backup',
    description: "Creates a backup for a database",
    arguments: [
      {
        label: 'Database name',
        inline: 'name',
        type: 'string'
      }
    ],
    runFunction: (name) => {
      const db = new Database(name);
      return db.load()
        .then(() => db.backup())
        .then(file => {
          log([
            `Backup file created`,
            file
          ]);
        })
    }
  },

  {
    label: 'List backups',
    command: 'list',
    description: "List all available backups for a database",
    arguments: [
      {
        label: 'Database name',
        inline: 'name',
        type: 'string'
      }
    ],
    runFunction: (name) => {
      const db = new Database(name);
      return db.load()
        .then(() => db.list())
        .then(files => {
          if (files.length === 0) {
            log([
              chalk.grey(`No backups have been made`),
              `Run ${ CLI_NAME } backup ${ name } to create one`
            ])
          } else {
            const msgs = ['Available files to backup:']

            files.forEach((f, index) => {
              msgs.push(`${ chalk.blue(index) }: ${f}`)
            });

            log(msgs);
          }
        })
    }
  },

  {
    label: 'Restore backup',
    command: 'restore',
    description: "Restores a backup",
    arguments: [
      {
        label: 'Database name',
        inline: 'name',
        type: 'string'
      },
      {
        label: 'Backup index',
        inline: 'backupIndex',
        type: 'number'
      }
    ],
    runFunction: (name, backupIndex) => {
      const db = new Database(name);

      log([
        ``,
        `Your password for the database user will be requested`
      ], false);

      return db.load()
        .then(() => db.restore(backupIndex))
        .then(backupFile => {
          log([
            chalk.grey(`Successfully restored data`),
            `Using data from ${ backupFile }`
          ])
        });
    }
  },

  {
    label: 'Schedule backup',
    command: 'schedule',
    description: "Starts a cron like scheduler to backup the database",
    arguments: [
      {
        label: 'Database name',
        inline: 'name',
        type: 'string'
      }
    ],
    runFunction: (name) => {
      const db = new Database(name);

      return db.load()
        .then(() => {
          log(`Creating cron with this time structure: ${ db.cron }`);
          cron.schedule(db.cron, () => {
            db.backup()
              .then(file => {
                log([
                  `Backup file created`,
                  file
                ]);
              });
          });
        })
    }
  },

  {
    label: 'Destroy',
    command: 'destroy',
    description: "Starts a cron like scheduler to backup the database",
    runFunction: () => {
      prompts({
        type: 'confirm',
        name: 'value',
        message: 'Are you sure delete all backup folders?',
        initial: true
      })
        .then(val => {
          if (val) {
            return engine.destroy();
          } else {
            return false;
          }
        })
    }
  }
];

const setupQuestions = () => {
  const questions = [
    {
        type: 'text',
        name: 'name',
        message: 'Database name?'
    },
    {
        type: 'text',
        name: 'user',
        message: 'Database user?'
    },
    {
        type: 'number',
        name: 'hours',
        message: 'Hour to backup database every day',
        initial: 12,
        validate: value => value > 23 || value < 0 ? `Has to be 0-23` : true
    },
    {
        type: 'number',
        name: 'backup_limit',
        message: 'How many backup files to keep?',
        initial: 20,
        validate: value => value > 100 || value < 0 ? `Has to be 0-100` : true
    }
  ]

  return prompts(questions);
}

const validateArguments = ({ arguments: commandArgs, command }, args) => {
  if (!commandArgs || commandArgs.length == 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const isValid = (val, type) => {
      switch (type) {
        case 'number':
          return !isNaN(parseInt(val)) && parseInt(val) == val;
        default:
          return (typeof val).toLowerCase() === type;
      }
    }

    commandArgs.forEach((a, index) => {
      if (!isValid(args[index], a.type)) {
        reject(`'${ args[index] }' is not of type '${ a.type }'. Run '${ CLI_NAME } help ${ command }'`);
      }
    });

    resolve()
  });
};

const getCommand = (cmd, commands = COMMANDS) => {
  return commands.find(c => c.command === cmd);
};

const logCommand = ({ label, description, command, arguments: args }, full = false) => {
  const msgs = [];
  msgs.push(chalk.green(command) + ` (${ label })`);

  if (full) {
    msgs.push(description);

    if (args.length) {
      msgs.push("\n" + chalk.blue("Arguments: "));

      args.forEach(({ inline , label, type }) => {
        msgs.push([ chalk.grey(inline), label, `(${ type })`].join('\t'));
      });
    }
  }

  log(msgs, false);
};

const log = (msgs = [], title = chalk.green("INFO: ")) => {
  let _msgs = msgs;
  if (!Array.isArray(_msgs)) {
    _msgs = [_msgs];
  }

  if (title) {
    console.log("\n" + title);
  }

  _msgs.forEach(m => {
    console.log(m);
  });

  console.log();
};

const logError = (err) => {
  console.log(`${ chalk.red("ERR: ")} ${ err }`);
  console.log();
};

const initialise = () => {
  return engine.runInitialise()
    .then(settings => {
      log([
        chalk.bgGreen.black(` ${ CLI_NAME } setup successfully `),
        chalk.grey(`Backup directory created: ${ settings.backup_dir }`),
        chalk.grey(`Settings directory created: ${ settings.settings_dir }`),
      ]);
    })
}

module.exports = { validateArguments, getCommand, log, logError, logCommand, initialise };
