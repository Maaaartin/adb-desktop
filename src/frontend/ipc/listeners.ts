import { AdbClientOptions, IAdbDevice } from 'adb-ts';
import { ipcRenderer as ipc } from 'electron';
import { Dictionary, get as getProp, isEmpty as emp } from 'lodash';
import Notifications from 'react-notification-system-redux';
import { AdbStatus } from '../redux/actions';
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
import { Action } from '../redux/reducers';
import store from '../redux/store';

const hookIpc = () => {
  ipc.on(DEVICE_ADD, (event, data: IAdbDevice) => {
    store.dispatch<Action<IAdbDevice>>({ type: DEVICE_ADD, payload: data });
    store.dispatch(Notifications.info({ title: `${data.id} plugged in` }));
  });

  ipc.on(DEVICE_CHANGE, (event, data: IAdbDevice) => {
    store.dispatch<Action<IAdbDevice>>({ type: DEVICE_CHANGE, payload: data });
  });

  ipc.on(DEVICE_REMOVE, (event, data: IAdbDevice) => {
    store.dispatch<Action<IAdbDevice>>({ type: DEVICE_REMOVE, payload: data });
    store.dispatch(Notifications.info({ title: `${data.id} plugged out` }));
  });

  ipc.on(LOAD_TOKEN, (event, data: string) => {
    store.dispatch<Action<string>>({
      type: LOAD_TOKEN,
      payload: data,
    });
  });

  ipc.on(ADB_STATUS, (event, data: AdbStatus) => {
    if (data.status === 'stopped') {
      store.dispatch({ type: DEVICE_REMOVE_ALL });
    } else if (data.status === 'error') {
      store.dispatch(Notifications.error({ title: 'ADB stopped' }));
    } else if (data.status === 'running') {
      store.dispatch(Notifications.success({ title: 'ADB started' }));
    }
    store.dispatch<Action<AdbStatus>>({ type: ADB_STATUS, payload: data });
  });

  ipc.on(LOAD_CONSOLE_SETTINGS, (event, data) => {
    store.dispatch<Action<Dictionary<any>>>({
      type: LOAD_CONSOLE_SETTINGS,
      payload: data,
    });
  });

  ipc.on(ADB_SETTINGS_LOAD, (event, data: AdbClientOptions) => {
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

export default hookIpc;
