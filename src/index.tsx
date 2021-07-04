import 'react-perfect-scrollbar/dist/css/styles.css';
import './frontend/assets/custom.css';
import './frontend/assets/main.css';

import {
  ADB_SETTINGS_LOAD,
  ADB_STATUS,
  DEVICE_ADD,
  DEVICE_CHANGE,
  DEVICE_REMOVE,
  LOAD_TOKEN,
} from './frontend/redux/actionTypes';
import { AdbClientOptions, IAdbDevice } from 'adb-ts';

import { Action } from './frontend/redux/reducers';
import { AdbStatus } from './shared';
import Notifications from 'react-notification-system-redux';
import { Provider } from 'react-redux';
import React from 'react';
import Root from './frontend/Root';
import hookIpc from './frontend/ipc/listeners';
import { typedIpcRenderer as ipc } from './ipcIndex';
import { render } from 'react-dom';
import store from './frontend/redux/store';

// TODO make CI take package.json version
// hookIpc();
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
  store.dispatch<Action<AdbStatus | AdbClientOptions>>({
    type: ADB_SETTINGS_LOAD,
    payload: data,
  });

  ipc.on('loadToken', (_e, token) => {
    store.dispatch<Action<string>>({
      type: LOAD_TOKEN,
      payload: token,
    });
  });
});

ipc.on('adbStatus', (_e, data) => {
  store.dispatch<Action<AdbStatus>>({ type: ADB_STATUS, payload: data });
});

ipc.on('deviceAdd', (e_, device) => {
  store.dispatch<Action<IAdbDevice>>({ type: DEVICE_ADD, payload: device });
});

ipc.on('deviceChange', (e_, device) => {
  store.dispatch<Action<IAdbDevice>>({ type: DEVICE_CHANGE, payload: device });
});

ipc.on('deviceRemove', (e_, device) => {
  store.dispatch<Action<IAdbDevice>>({ type: DEVICE_REMOVE, payload: device });
});

render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
