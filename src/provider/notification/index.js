const { Notification } = require('electron');

module.exports = config => {
  const notification = new Notification(Object.assign({
    silent: true,
  }, config));

  return {
    show() {
      notification.show();
    },
  };
};
