/**
 * Service Base Class
 */
const { ipcMain } = require('electron');
const { killPid } = require('../utils/index');

class ServiceStore {
  constructor() {
    this.store = new Map();
    ipcMain.on('SERVICE:req-stop-all', this.stopAllService.bind(this));
  }
  stopAllService() {
    for (const [pid, ps] of this.store.entries()) {
      killPid(ps, pid, () => {
        this.store.delete(pid);
      });
    }
    ipcMain.emit('SERVICE:stop-all-done');
  }
  set(pid, ps) {
    this.store.set(pid, ps);
  }
  get(pid) {
    this.store.get(pid);
  }
  has(pid) {
    return this.store.has(pid);
  }
  delete(pid) {
    const ps = this.store.get(pid);
    if (ps) {
      killPid(ps, pid, () => {
        this.store.delete(pid);
      });
    }
  }
}

exports.serviceStore = new ServiceStore();
