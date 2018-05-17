/**
 * @author ryan.bian
 */
import { shell, ipcRenderer } from 'electron';
import { Modal } from 'antd';
import App from './App';
import render from './run';
import configureStore from './configureStore';

const { store, persistor } = configureStore();

window.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'a' &&
    e.target.getAttribute('target') === '_blank') {
    e.preventDefault();
    shell.openExternal(e.target.getAttribute('href'));
  }
}, false);

ipcRenderer.on('CORE:BEFORE_CLOSE', () => {
  const state = store.getState();
  const instances = state['page.project'].getIn(['service', 'instances']).toJS();
  ipcRenderer.send('CORE:BEFORE_CLOSE:REPLY', instances);
});

let confirmRef;
ipcRenderer.on('CORE:SERVICE_NOT_END', () => {
  if (confirmRef) return;
  confirmRef = Modal.confirm({
    title: '警告',
    content: '服务尚未停止，您确定要关闭 Jarvis 吗？',
    iconType: 'warning',
    okText: '确认关闭',
    cancelText: '取消',
    zIndex: 1031,
    onOk() {
      ipcRenderer.send('CORE:SERVICE_NOT_END:CLOSE');
      confirmRef = null;
    },
    onCancel() {
      confirmRef = null;
    }
  });
});

ipcRenderer.on('CORE:CLOSE_SERVICE_FAILED', (e, msg) => {
  Modal.error({
    title: '服务停止异常',
    content: msg,
    zIndex: 1031,
  });
});

render(App, store, persistor);
