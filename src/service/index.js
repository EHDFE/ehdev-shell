/**
 * Service Base Class
 */
const { killPid } = require('../utils/index');

class ServiceStore {
  constructor() {
    this.store = new Map();
  }
  stopAllService() {
    const killPending = [];
    for (const [pid, ps] of this.store.entries()) {
      killPending.push(
        killPid(ps, pid).then(() => {
          this.store.delete(pid);
        })
      );
    }
    return Promise.all(killPending);
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
      killPid(ps, pid).then(() => {
        this.store.delete(pid);
      });
    }
  }
}

exports.serviceStore = new ServiceStore();
