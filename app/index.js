/**
 * @author ryan.bian
 */
import { shell, ipcRenderer } from 'electron';
import localforage from 'localforage';
import App from './App';
import render from './run';
import getStore from './configureStore';


window.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'a' &&
    e.target.getAttribute('target') === '_blank') {
    e.preventDefault();
    shell.openExternal(e.target.getAttribute('href'));
  }
}, false);

getStore()
  .then(store => {

    const saveState = () => {
      localforage.setItem('APP_STATE', store.getState());
    };

    ipcRenderer.on('APP_WILL_CLOSE', () => {
      saveState();
    });
    ipcRenderer.on('APP:unresponsive', () => {
      saveState();
    });

    const SAVE_INTERVAL = 60 * 1000;
    setInterval(() => {
      saveState();
    }, SAVE_INTERVAL);

    render(App, store);

    if (module.hot) {
      module.hot.accept('./App', () => {
        render(App, store);
      });
    }
  });

