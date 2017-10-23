/**
 * Project Configer Class
 * @author ryan.bian
 */
const path = require('path');
const { app } = require('electron');
const merge = require('webpack-merge');

const { npmInstall, npmOutdated } = require('../models/project/npm');

class Configer {
  constructor() {
    this.dir = app.getPath('appData');
  }
  /**
   * install a new configer
   * @param {string} name - configer name
   */
  install(name) {

  }
  /**
   * uninstall one configer
   * @param {string} name - configer name
   */
  uninstall(name) {

  }
  /**
   * get a list of configers
   * @param {boolean} remote - read the list from npm or local
   */
  ls(remote = false) {

  }
  /**
   * check current configers are updated
   */
  checkUpdate() {

  }
  /**
   * read one configer
   * @param {string} name - configer name
   */
  getConfiger(name) {

  }
}

module.exports = Configer;

