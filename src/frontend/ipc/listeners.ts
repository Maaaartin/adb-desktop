import {
  ADB_SETTINGS_LOAD,
  ADB_STATUS,
  DEVICE_ADD,
  DEVICE_CHANGE,
  DEVICE_REMOVE,
  DEVICE_REMOVE_ALL,
  LOAD_CONSOLE_SETTINGS,
  LOAD_TOKEN,
} from '../redux/actionTypes';
import { AdbClientOptions, IAdbDevice } from 'adb-ts';
import { Dictionary, isEmpty as emp, get as getProp } from 'lodash';

import { Action } from '../redux/reducers';
import { AdbStatus } from '../../shared';
import { DISPLAY_ERROR } from '../../constants';
import Notifications from 'react-notification-system-redux';
import { ipcRenderer as ipc } from 'electron';
import store from '../redux/store';

const hookIpc = () => {
  ipc.on(DEVICE_ADD, (_e, data: IAdbDevice) => {
    store.dispatch<Action<IAdbDevice>>({ type: DEVICE_ADD, payload: data });
    store.dispatch(Notifications.info({ title: `${data.id} plugged in` }));
  });

  ipc.on(DEVICE_CHANGE, (_e, data: IAdbDevice) => {
    store.dispatch<Action<IAdbDevice>>({ type: DEVICE_CHANGE, payload: data });
  });

  ipc.on(DEVICE_REMOVE, (_e, data: IAdbDevice) => {
    store.dispatch<Action<IAdbDevice>>({ type: DEVICE_REMOVE, payload: data });
    store.dispatch(Notifications.info({ title: `${data.id} plugged out` }));
  });

  ipc.on(LOAD_TOKEN, (_e, data: string) => {
    if (emp(data)) {
      store.dispatch(
        Notifications.error({
          title: 'Could not read emulator_console_token file',
          message:
            'Emulator console API will not be availabe without the token',
          position: 'tr',
        })
      );
    } else {
      store.dispatch<Action<string>>({
        type: LOAD_TOKEN,
        payload: data,
      });
    }
  });

  ipc.on(ADB_STATUS, (_e, data: AdbStatus) => {
    if (data.status === 'stopped') {
      store.dispatch({ type: DEVICE_REMOVE_ALL });
    } else if (data.status === 'error') {
      store.dispatch(Notifications.error({ title: 'ADB stopped' }));
    } else if (data.status === 'running') {
      store.dispatch(Notifications.success({ title: 'ADB started' }));
    }
    store.dispatch<Action<AdbStatus>>({ type: ADB_STATUS, payload: data });
  });

  ipc.on(LOAD_CONSOLE_SETTINGS, (_e, data) => {
    store.dispatch<Action<Dictionary<any>>>({
      type: LOAD_CONSOLE_SETTINGS,
      payload: data,
    });
  });

  ipc.on(ADB_SETTINGS_LOAD, (_e, data: AdbClientOptions) => {
    if (emp(getProp(data, 'bin'))) {
      store.dispatch(
        Notifications.error({
          title: 'Could not locate ADB binary',
          message: 'Please specify the full path to the ADB binary file',
          position: 'tr',
        })
      );
    }
    store.dispatch<Action<AdbClientOptions>>({
      type: ADB_SETTINGS_LOAD,
      payload: data,
    });
  });
};

ipc.on(DISPLAY_ERROR, (_e, data: Error) => {
  store.dispatch(
    Notifications.error({
      title: 'Error',
      message: data.message,
      position: 'tr',
    })
  );
});

export default hookIpc;
