/**
 * context
 * @author ryan.bian
 */
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const DataStore = require('nedb');

const USERDATA_PATH = app.getPath('userData');
fs.stat(path.join(USERDATA_PATH, 'project.db'), (e, stats) => {
  if (e) return;
  if (stats.isFile()) {
    fs.unlink(path.join(USERDATA_PATH, 'project.db'));
  }
});

const DB_LIST = [
  'upload',
  'workspace',
  // 'project',
  // 'pomodora',
];

const DB = {};
DB_LIST.forEach(name => {
  Object.assign(DB, {
    [name]: new DataStore({
      filename: path.join(USERDATA_PATH, `${name}.db`),
      autoload: true,
    })
  });
});

class Context {
  constructor(db) {
    this.db = db;
    this.store = {};
  }
  setEnv(key, value) {
    this.store[key] = value;
  }
  getEnv(key) {
    return this.store[key];
  }
  getDataBase(name) {
    return this.db[name];
  }
}

module.exports = new Context(DB);
