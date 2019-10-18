const { getDatabaseSettings, saveDatabaseSettings } = require('../engine');

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
}

module.exports = Database;
