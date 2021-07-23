import {
  AdbAction,
  ConsoleAction,
  DeviceAction,
  EmulatorAction,
  UiAction,
} from './actionTypes';
import { AdbClientOptions, IAdbDevice } from 'adb-ts';
import {
  AdbRuntimeStatus,
  ConsoleSettings,
  ConsoleSettingsUpdate,
  isTest,
} from '../../shared';

import Notifications from 'react-notification-system-redux';
import { typedIpcRenderer as ipc } from '../../ipcIndex';
import store from './store';

export type Tab = {
  id: string;
  name: string;
  content: JSX.Element;
};

function createTab(
  name: string,
  cb: (id: string) => JSX.Element
): Readonly<Tab> {
  const id = Math.random().toString(36).substring(7);
  const content = cb(id);
  return {
    name,
    content,
    id,
  };
}

const SettingsAction = Notifications.success({ title: 'Settings saved' });

export const writeAdbSettings = (data: AdbClientOptions): AdbAction => {
  if (!isTest) {
    ipc.send('writeAdbSettings', data);
  }
  store.dispatch(SettingsAction);
  return {
    type: 'AdbSettingsWrite',
    payload: data,
  };
};

export const loadAdbSettings = (payload: AdbClientOptions): AdbAction => ({
  type: 'AdbSettingsLoad',
  payload,
});

export const setAdbStatus = (data: AdbRuntimeStatus): AdbAction => {
  if (data.status === 'stopped') {
    store.dispatch(Notifications.warning({ title: 'ADB stopped' }));
  } else if (data.status === 'error') {
    store.dispatch(Notifications.error({ title: 'ADB stopped with error' }));
  } else if (data.status === 'running') {
    store.dispatch(Notifications.success({ title: 'ADB started' }));
  }
  return {
    type: 'AdbStatus',
    payload: data,
  };
};

export const deviceAdd = (device: IAdbDevice): DeviceAction => ({
  type: 'DeviceAdd',
  payload: device,
});

export const deviceChange = (device: IAdbDevice): DeviceAction => ({
  type: 'DeviceChange',
  payload: device,
});

export const deviceRemove = (device: IAdbDevice): DeviceAction => ({
  type: 'DeviceRemove',
  payload: device,
});

export const deviceRemoveAll = (): DeviceAction => ({
  type: 'DeviceRemoveAll',
});

export const tabAdd = (name: string, cb: (id: string) => JSX.Element) => ({
  type: 'TabAdd',
  payload: createTab(name, cb),
});

export const tabDel = (id: string): UiAction => ({
  type: 'TabDel',
  payload: id,
});

export const addHistory = (payload: string): ConsoleAction => ({
  type: 'ConsoleAddHistory',
  payload,
});

export const writeConsoleSettings = (
  payload: ConsoleSettingsUpdate
): ConsoleAction => {
  if (!isTest) {
    ipc.send('writeConsoleSettings', payload);
  }
  store.dispatch(SettingsAction);
  return { type: 'ConsoleWriteSettings', payload };
};

export const loadConsoleSettings = (
  payload: ConsoleSettings
): ConsoleAction => ({
  type: 'ConsoleLoadSettings',
  payload,
});

export const writeToken = (token: string): EmulatorAction => {
  if (!isTest) {
    ipc.send('writeToken', token);
  }
  store.dispatch(SettingsAction);
  return {
    type: 'TokenWrite',
    payload: token,
  };
};

export const loadToken = (token: string): EmulatorAction => ({
  type: 'TokenLoad',
  payload: token,
});
