const log = require('electron-log');
const { EventEmitter } = require('events');
const notifier = require('node-notifier');

const emitter = new EventEmitter();

notifier.on('click', (...args) => {
  emitter.emit('click', ...args);
});
notifier.on('timeout', (...args) => {
  emitter.emit('timeout', ...args);
});

module.exports = {
  notify(config, responser) {
    notifier.notify(
      config,
      (error, response, metadata) => {
        if (error) {
          log.error(error.toString());
          responser && responser(error);
        } else {
          responser && responser(error, response, metadata);
        }
      },
    );

    return emitter;
  },
};
