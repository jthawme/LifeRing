const path = require('path');

const jsonfile = require('jsonfile');

const { DEFAULTS } = require('../constants');
const { getSettings } = require('../src/defaults');



function getDatabaseFileName(name) {
  return [DEFAULTS.DB_PREFIX, name, '.json'].join('');
}

function getDatabaseFile(name) {
  return getSettings()
    .then(settings => path.join(settings.settings_dir, getDatabaseFileName(name)))
}


/**
 * Function to retrieve database settings
 *
 * @param {String} name The name of the database file
 */
function getDatabaseSettings(name) {
  return getDatabaseFile(name)
    .then(settingsFile => {
      return new Promise((resolve, reject) => {
        jsonfile.readFile(settingsFile, (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(data);
        });
      });
    });
}

/**
 * Function to save database settings
 *
 * @param {String} name The name of the database file
 * @param {Object} data The data to save for the database
 */
function saveDatabaseSettings(name, data) {
  return getDatabaseFile(name)
    .then(settingsFile => {
      return new Promise((resolve, reject) => {
        jsonfile.writeFile(settingsFile, data, (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(data);
        });
      });
    });
}

module.exports = { getDatabaseFileName, getDatabaseFile, getDatabaseSettings, saveDatabaseSettings };
