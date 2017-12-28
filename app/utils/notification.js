const showNotification = (title, options) => {
  const instance = new Notification(title, options);
  return {
    afterClick: () => new Promise(resolve => {
      instance.onclick = () => {
        resolve();
      };
    }),
    whenError: () => new Promise(resolve => {
      instance.onerror = () => {
        resolve();
      };
    }),
  };
};

export default showNotification;
