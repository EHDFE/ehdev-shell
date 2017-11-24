/**
 * @author ryan.bian
 */
import App from './App';
import render from './run';
import store from './configureStore';

render(App, store);

if (module.hot) {
  module.hot.accept('./App', () => {
    render(App, store);
  });
}
