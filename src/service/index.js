/**
 * Service Base Class
 */
const { spawn } = require('child_process');

class ServiceStore {
  constructor() {
    this.store = new Map();
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
      this.store.delete(pid);
      ps.kill('SIGTERM');
    }
  }
}

exports.serviceStore = new ServiceStore();
