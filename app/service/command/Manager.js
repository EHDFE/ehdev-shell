import EventEmitter from 'events';
import Mousetrap from 'mousetrap';
import isString from 'lodash/isString';
import EnvUtils from '../../utils/env';

const FNKEY_SYMBOL_MAP = new Map([
  ['command', '⌘'],
  ['alt', '⎇'],
  ['option', '⌥'],
  ['ctrl', '⌃'],
  ['shift', '⇧'],
]);

export default class CommandManager {
  constructor(config) {
    this.emitter = new EventEmitter();
    this.commands = new Map();
    this.kbdShortcuts = new Map();
    this.listenerMap = new Map();
    this.registCommands(config);
    this.registKeyboardShortcutEvents();
  }
  registCommands(config) {
    Object.keys(config).forEach(key => {
      const c = config[key];
      const v = {
        command: c.command,
      };
      if (c.keymap) {
        Object.assign(v, {
          shortcut: this.parseKeymap(c.keymap, c.command),
        });
      }
      this.commands.set(key, v);
    });
  }
  registKeyboardShortcutEvents() {
    if (this.kbdShortcuts.size > 0) {
      this.kbdShortcuts.forEach((command, shortcut) => {
        Mousetrap.bind(shortcut, e => {
          this.emitCommand(command);
        });
      });
    }
  }
  addListener(command, listener) {
    const channel = `[COMMAND]:${command}`;
    this.emitter.on(channel, listener);
    this.listenerMap.set(channel, listener);
    return () => {
      this.emitter.removeListener(channel, listener);
      this.listenerMap.delete(channel);
    };
  }
  addListeners(listenerMap) {
    const channels = Object.keys(listenerMap)
      .map(command => {
        this.addListener(command, listenerMap[command]);
        return `[COMMAND]:${command}`;
      });
    return () => {
      this.emitter.removeAllListeners(channels);
    };
  }
  getCommands() {
    return [...this.commands].map(group => ({
      name: group[0],
      ...group[1],
      id: group[1].command,
      content: group[1].command,
    }));
  }
  parseKeymap(shortcut, command) {
    let sct;
    if (!isString(shortcut)) {
      if (EnvUtils.isMac) {
        sct = shortcut.osx;
      } else {
        sct = shortcut.windows;
      }
    } else {
      sct = shortcut;
    }
    const group = sct.split('+');
    this.kbdShortcuts.set(sct, command);
    return group
      .map(key => {
        let k = key;
        if (FNKEY_SYMBOL_MAP.has(key)) {
          k = FNKEY_SYMBOL_MAP.get(key);
        }
        return `<kbd>${k}</kbd>`;
      })
      .join('');
  }
  emitCommand(command) {
    this.emitter.emit(`[COMMAND]:${command}`);
  }
  destroy() {
    if (this.handleKeydown) {
      window.removeEventListener('keydown', this.handleKeydown, false);
    }
    this.kbdShortcuts.clear();
    this.commands.clear();
    Mousetrap.reset();
  }
}
