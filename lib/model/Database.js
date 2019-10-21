const { exec } = require('child_process');
const { getDatabaseSettings, saveDatabaseSettings, getBackupName, getBackupFilePath, getBackupFiles, trimBackupFiles } = require('../engine');

class Database {
  constructor(name) {
    if (!name) {
      throw new Error("Database requires name");
    }

    this._name = name;
    this.properties = {};
  }

  get name() {
    return this._name;
  }

  set name(val) {
    this._name = val;
  }

  get user() {
    return this.properties.user;
  }

  set user(val) {
    this.properties.user = val;
  }

  get hours() {
    return this.properties.hours;
  }

  set hours(val) {
    this.properties.hours = val;
  }

  get backup_limit() {
    return this.properties.backup_limit;
  }

  set backup_limit(val) {
    this.properties.backup_limit = val;
  }

  get cron() {
    // return `*/1 * * * *`;
    return `* ${ this.properties.hours } * * *`;
  }

  get keys() {
    return ['name', 'user', 'hours', 'backup_limit', 'cron']
  }

  get fillable() {
    return ['user', 'hours', 'backup_limit'];
  }

  fill(obj) {
    Object.keys(obj).forEach(k => {
      if (this.fillable.includes(k)) {
        this.properties[k] = obj[k];
      }
    });
  }

  return() {
    const obj = {};

    this.keys.forEach(k => {
      obj[k] = this[k];
    });

    return {
      ...obj,
      name: this.name
    };
  }

  load() {
    return getDatabaseSettings(this.name)
      .then(data => {
        this.fill(data);
        return data;
      });
  }

  save() {
    return saveDatabaseSettings(this.name, this.return());
  }

  backup() {
    return new Promise((resolve, reject) => {
        const fileName = getBackupName(this.name);
        const targetFile = getBackupFilePath(fileName);
        const data = {
          absolute: targetFile,
          fileName
        };

        if (this.__testing) {
          resolve(data);
          return;
        }

        const proc = exec(`pg_dump --username=${ this.user } ${ this.name } -f ${ targetFile } -F t`);

        proc.on('error', err => {
          reject(err);
        });

        proc.on('close', () => {
          this.limit();
          resolve(targetFile);
        });
    });
  }

  list() {
    return getBackupFiles(this.name);
  }

  limit(limit = false) {
    return trimBackupFiles(this.name, limit || this.backup_limit)
  }

  restore(backupIndex = 0) {
    const files = this.list();

    if (!files[backupIndex]) {
        return Promise.reject(`There is no backup index '${ backupIndex }' for the database '${ this.name }'`);
    }

    return new Promise((resolve, reject) => {
        const targetFile = getBackupFilePath(files[backupIndex]);

        if (this.__testing) {
          resolve(targetFile);
          return;
        }

        const proc = exec(`pg_restore -c -U ${this.user} -d ${this.name} -v "${targetFile}" -W`);

        proc.on('error', err => {
          reject(err);
        });
        proc.on('close', () => {
          resolve(targetFile);
        });
    });
  }

  _setTesting() {
    this.__testing = true;
  }
}

module.exports = Database;
