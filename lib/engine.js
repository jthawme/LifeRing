

const defaults = require('./src/defaults.js');
const database = require('./src/database.js');

module.exports = {
    ...defaults,
    ...database
};
