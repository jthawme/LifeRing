

const defaults = require('./src/defaults.js');
const database = require('./src/database.js');
const backups = require('./src/backups.js');

module.exports = {
    ...defaults,
    ...database,
    ...backups,
};
