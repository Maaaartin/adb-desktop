import 'react-perfect-scrollbar/dist/css/styles.css';
import './frontend/assets/custom.css';
import './frontend/assets/main.css';

import {
  ADB_SETTINGS_LOAD,
  ADB_STATUS,
  DEVICE_ADD,
  DEVICE_CHANGE,
  DEVICE_REMOVE,
  DEVICE_REMOVE_ALL,
  DeviceAT,
  LOAD_CONSOLE_SETTINGS,
  LOAD_TOKEN,
} from './frontend/redux/actionTypes';

import Notifications from 'react-notification-system-redux';
import { Provider } from 'react-redux';
import React from 'react';
import Root from './frontend/Root';
import { typedIpcRenderer as ipc } from './ipcIndex';
import { render } from 'react-dom';
import store from './frontend/redux/store';

store.dispatch({ type: DeviceAT.Add, payload: {} });
// TODO make CI take package.json version
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
  store.dispatch({
    type: ADB_SETTINGS_LOAD,
    payload: data,
  });
});

ipc.on('loadToken', (_e, token) => {
  store.dispatch({
    type: LOAD_TOKEN,
    payload: token,
  });
});

ipc.on('loadConsoleSettings', (_e, data) => {
  console.log('got ya');
  console.log(data);
  store.dispatch({
    type: LOAD_CONSOLE_SETTINGS,
    payload: data,
  });
});

ipc.on('adbStatus', (_e, data) => {
  store.dispatch({ type: ADB_STATUS, payload: data });
  if (data.status === 'stopped') {
    store.dispatch({ type: DEVICE_REMOVE_ALL });
  }
});

ipc.on('deviceAdd', (_e, device) => {
  store.dispatch({ type: DEVICE_ADD, payload: device });
});

ipc.on('deviceChange', (_e, device) => {
  store.dispatch({ type: DEVICE_CHANGE, payload: device });
});

ipc.on('deviceRemove', (_e, device) => {
  store.dispatch({ type: DEVICE_REMOVE, payload: device });
});

render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
