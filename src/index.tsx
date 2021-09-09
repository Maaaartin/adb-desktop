import 'react-perfect-scrollbar/dist/css/styles.css';
import './frontend/assets/custom.css';
import './frontend/assets/main.css';

import {
  deviceAdd,
  deviceChange,
  deviceRemove,
  deviceRemoveAll,
  loadAdbSettings,
  loadConsoleSettings,
  loadToken,
  setAdbStatus,
} from './frontend/redux/actions';

import Notifications from 'react-notification-system-redux';
import { Provider } from 'react-redux';
import React from 'react';
import Root from './frontend/Root';
import { typedIpcRenderer as ipc } from './ipcIndex';
import { render } from 'react-dom';
import store from './frontend/redux/store';

ipc.on('displayError', (_e, err) => {
  store.dispatch(
    Notifications.error({
      title: 'Error',
      message: err?.message,
      position: 'tr',
    })
  );
});

ipc.on('loadAdbSettings', (_e, data) => {
  store.dispatch(loadAdbSettings(data));
});

ipc.on('loadToken', (_e, token) => {
  store.dispatch(loadToken(token));
});

ipc.on('loadConsoleSettings', (_e, data) => {
  store.dispatch(loadConsoleSettings(data));
});

ipc.on('adbStatus', (_e, data) => {
  store.dispatch(setAdbStatus(data));
  if (data.status === 'stopped') {
    store.dispatch(deviceRemoveAll());
  }
});

ipc.on('deviceAdd', (_e, device) => {
  store.dispatch(deviceAdd(device));
});

ipc.on('deviceChange', (_e, device) => {
  store.dispatch(deviceChange(device));
});

ipc.on('deviceRemove', (_e, device) => {
  store.dispatch(deviceRemove(device));
});

render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
