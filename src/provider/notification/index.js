const notifier = require('node-notifier');

module.exports = {
  notify(config, responser, callbacks = {}) {
    notifier.notify(
      config,
      responser,
    );

    const {
      onClick,
      onTimeout,
    } = callbacks;

    if (onClick) {
      notifier.on('click', (notifierObject, options) => {
        onClick();
      });
    }

    if (onTimeout) {
      notifier.on('timeout', (notifierObject, options) => {
        onTimeout();
      });
    }

  },
};
