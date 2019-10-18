const path = require('path');

const DEFAULTS = {
    BACKUP_DIR: 'lifering_backups',
    SETTINGS_DIR: 'settings',
    SETTINGS_FILE: 'global.json',
    DB_PREFIX: 'database-',
};

const ROOT = path.join(__dirname, '..');

module.exports = { DEFAULTS, ROOT };
