/**
 * @author ryan.bian
 */
import { shell } from 'electron';
import App from './App';
import render from './run';
import store from './configureStore';

window.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'a' &&
    e.target.getAttribute('target') === '_blank') {
    e.preventDefault();
    shell.openExternal(e.target.getAttribute('href'));
  }
}, false);

render(App, store);

if (module.hot) {
  module.hot.accept('./App', () => {
    render(App, store);
  });
}
