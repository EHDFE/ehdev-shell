/**
 * context
 * @author ryan.bian
 */
const path = require('path');
const { app } = require('electron');
const DataStore = require('nedb');

const USERDATA_PATH = app.getPath('userData');
const DB_LIST = [
  'upload',
  'project',
  'pomodora',
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
