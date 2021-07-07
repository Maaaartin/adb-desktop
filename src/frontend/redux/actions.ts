import {
  ADB_SETTINGS_WRITE,
  ADB_STATUS,
  ADD_HISTORY,
  DEVICE_ADD,
  DEVICE_CHANGE,
  DEVICE_REMOVE,
  DEVICE_REMOVE_ALL,
  LOAD_TOKEN,
  TAB_ADD,
  TAB_DEL,
  WRITE_CONSOLE_SETTINGS,
} from './actionTypes';
import { AdbClientOptions, IAdbDevice } from 'adb-ts';

import { AdbStatus } from '../../shared';
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

export const deviceAdd = (content: IAdbDevice) => {
  store.dispatch(Notifications.info({ title: `${content.id} plugged in` }));
  return {
    type: DEVICE_ADD,
    payload: content,
  };
};

export const deviceChange = (content: IAdbDevice) => ({
  type: DEVICE_CHANGE,
  payload: content,
});

export const deviceRemove = (content: IAdbDevice) => {
  store.dispatch(Notifications.info({ title: `${content.id} plugged out` }));
  return {
    type: DEVICE_REMOVE,
    payload: content,
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

export const addHistory = (content: string) => ({
  type: ADD_HISTORY,
  payload: content,
});

export const writeToken = (token: string) => {
  if (process.env.NODE_ENV != 'test') {
    ipc.send('writeToken', token);
  }
  store.dispatch(SettingsAction);
  return {
    type: LOAD_TOKEN,
    payload: token,
  };
};

export const setAdbStatus = (data: AdbStatus) => {
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

export const writeConsoleSettings = (data: {
  history?: string[];
  historyLen?: number;
  lines?: number;
}) => {
  if (process.env.NODE_ENV != 'test') {
    ipc.send('writeConsoleSettings', data);
  }
  store.dispatch(SettingsAction);
  return {
    type: WRITE_CONSOLE_SETTINGS,
    payload: data,
  };
};
