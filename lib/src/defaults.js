const path = require('path');
const os = require('os');

const fs = require('fs-extra');
const jsonfile = require('jsonfile');
const open = require('open');

const { DEFAULTS, ROOT } = require('../constants');


/**
 * Returns the object that constructs the default
 * settings object
 */
function getDefaultSettings() {
    return {
        "backup_dir": getDefaultBackupDirectory(),
        "settings_dir": getSettingsDirectory()
    };
}


/**
 * Returns the location of the default backup directory
 */
function getDefaultBackupDirectory() {
    return path.join(os.homedir(), DEFAULTS.BACKUP_DIR);
}


/**
 * Opens the location of the backup directory
 */
function openBackupDirectory() {
  return open(getSetting('backup_dir'))
}


/**
 * A utility function to ensure that a directory exists
 * and creates it if doesnt
 *
 * @param {String} dir Path to the directory
 */
function ensureDirectory(dir) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dir)) {
            resolve(dir);
            return;
        } else {
            fs.mkdir(dir, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dir);
                }
            });
        }
    });
}


/**
 * A utility function to remove a directory if it exists
 *
 * @param {String} dir Path to the directory
 */
function removeDirectory(dir) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dir)) {
            resolve(dir);
            return;
        } else {
            fs.remove(dir, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dir);
                }
            });
        }
    });
}


/**
 * Gets the absolute path of the settings
 * directory
 */
function getSettingsDirectory() {
    return path.join(ROOT, DEFAULTS.SETTINGS_DIR);
}


/**
 * Gets the absolute path of the settings file
 */
function getSettingsFile() {
    return path.join(getSettingsDirectory(), DEFAULTS.SETTINGS_FILE);
}


/**
 * Function to commit settings to the settings file location
 *
 * @param {Object} settings The settings object to save
 */
function saveSettings(settings) {
    return new Promise((resolve, reject) => {
        jsonfile.writeFile(getSettingsFile(), settings, err => {
            if (err) {
                reject(err);
                return;
            }

            resolve(settings);
        });
    });
}


/**
 * Function to retrieve global settings
 */
function getSettings() {
  return jsonfile.readFileSync(getSettingsFile());
}


/**
 * Function to retrieve specific global setting
 *
 * @param {String} key
 */
function getSetting(key) {
  const settings = getSettings();
  return settings[key];
}



/**
 * The main interface for running all of the necessary
 * settings at setup
 */
function runInitialise() {
    const settings = getDefaultSettings()
    const settingsDir = getSettingsDirectory();

    return Promise.all([
        ensureDirectory(settingsDir),
        ensureDirectory(settings.backup_dir),
    ])
        .then(() => saveSettings(settings));
}



/**
 * Function to destroy related folders
 */
function destroy() {
  const settings = getDefaultSettings()
  const settingsDir = getSettingsDirectory();

  return Promise.all([
      removeDirectory(settingsDir),
      removeDirectory(settings.backup_dir),
  ]);
}


module.exports = {
    getDefaultSettings, getDefaultBackupDirectory, ensureDirectory, removeDirectory,
    runInitialise, getSettingsDirectory, getSettingsFile, saveSettings, getSettings,
    getSetting, destroy, openBackupDirectory
};
