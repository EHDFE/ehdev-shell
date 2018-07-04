/**
 * context
 * @author ryan.bian
 */
const path = require('path');
const { app } = require('electron');
const DataStore = require('nedb');

const USERDATA_PATH = app.getPath('userData');

const ALLOWED_DB = new Set([
  'upload',
  'workspace',
  'feeds',
]);

class Context {
  constructor() {
    this.db = new Map();
    this.store = new Map();
  }
  _addDB(name) {
    if (ALLOWED_DB.has(name)) {
      const newDb = new DataStore({
        filename: path.join(USERDATA_PATH, `${name}.db`),
        autoload: true,
      });
      this.db.set(name, newDb);
    }
  }
  setEnv(key, value) {
    this.store.set(key, value);
  }
  getEnv(key) {
    return this.store.get(key);
  }
  getDataBase(name) {
    if (!this.db.has(name)) {
      this._addDB(name);
    }
    return this.db.get(name);
  }
}

module.exports = new Context();
