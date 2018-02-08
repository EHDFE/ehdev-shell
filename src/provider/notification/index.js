const notifier = require('node-notifier');
const { EventEmitter } = require('events');

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
      responser,
    );

    return emitter;
  },
};
