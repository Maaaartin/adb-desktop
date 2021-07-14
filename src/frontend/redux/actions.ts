import {
  ADB_SETTINGS_WRITE,
  ADB_STATUS,
  ADD_HISTORY,
  DEVICE_ADD,
  DEVICE_CHANGE,
  DEVICE_REMOVE,
  DEVICE_REMOVE_ALL,
  DeviceAT,
  DeviceAction,
  LOAD_TOKEN,
  TAB_ADD,
  TAB_DEL,
  WRITE_CONSOLE_SETTINGS,
} from './actionTypes';
import { AdbClientOptions, IAdbDevice } from 'adb-ts';

import { AdbRuntimeStatus } from '../../shared';
import Notifications from 'react-notification-system-redux';
import { typedIpcRenderer as ipc } from '../../ipcIndex';
import store from './store';

export class Tab {
  id: string = '';
  content: any;
  name: string = '';
  constructor(name: string, content: any, id?: string) {
    this.content = content;
    this.name = name;
    this.id = id || '';
  }

  getId() {
    return this.id;
  }
}

const SettingsAction = Notifications.success({ title: 'Settings saved' });

export const writeAdbSettings = (data: AdbClientOptions) => {
  if (process.env.NODE_ENV != 'test') {
    ipc.send('writeAdbSettings', data);
  }
  store.dispatch(SettingsAction);
  return {
    type: ADB_SETTINGS_WRITE,
    payload: data,
  };
};

export const tabAdd = (tab: Tab) => ({
  type: TAB_ADD,
  payload: tab,
});

export const tabDel = (id: string) => ({
  type: TAB_DEL,
  payload: id,
});

export const setAdbStatus = (data: AdbRuntimeStatus) => {
  if (data.status === 'stopped') {
    store.dispatch({ type: DEVICE_REMOVE_ALL });
  } else if (data.status === 'error') {
    store.dispatch(Notifications.error({ title: 'ADB stopped' }));
  } else if (data.status === 'running') {
    store.dispatch(Notifications.success({ title: 'ADB started' }));
  }
  return {
    type: ADB_STATUS,
    payload: data,
  };
};
