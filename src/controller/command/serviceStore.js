/**
 * Service Base Class
 */
const { killPid } = require('../../utils/index');

class ServiceStore {
  constructor() {
    this.store = new Map();
  }
  stopAllService() {
    const killPending = [];
    for (const [pid, ps] of this.store.entries()) {
      killPending.push(
        this.kill(pid).then(() => {
          this.delete(pid);
        })
      );
    }
    return Promise.all(killPending);
  }
  set(pid, ps) {
    this.store.set(pid, ps);
  }
  get(pid) {
    return this.store.get(pid);
  }
  has(pid) {
    return this.store.has(pid);
  }
  kill(pid) {
    const ps = this.store.get(pid);
    if (ps) return killPid(ps, pid);
    return Promise.resolve();
  }
  delete(pid) {
    this.store.delete(pid);
  }
}

module.exports = new ServiceStore();
