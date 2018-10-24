/**
 * terminal apis
 * @author ryan.bian
 */
import { remoteAPI } from './utils';

const TERMINAL_API = {
  initialize() {
    return new remoteAPI.pty();
  },
  getInstance(pid) {
    return remoteAPI.pty.pool.get(pid);
  },
};

export default TERMINAL_API;
