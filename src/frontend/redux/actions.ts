import {
  AdbAction,
  ConsoleAction,
  DeviceAction,
  EmulatorAction,
  TabAction,
} from './actionTypes';
import { AdbClientOptions, IAdbDevice } from 'adb-ts';
import {
  AdbRuntimeStatus,
  ConsoleSettings,
  ConsoleSettingsUpdate,
} from '../../shared';

import Notifications from 'react-notification-system-redux';
import { typedIpcRenderer as ipc } from '../../ipcIndex';
import store from './store';

export function createTab(name: string, content: any): Readonly<Tab> {
  return {
    name,
    content,
    id: Math.random().toString(36).substring(7),
  } as Readonly<Tab>;
}
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

export const writeAdbSettings = (data: AdbClientOptions): AdbAction => {
  if (process.env.NODE_ENV != 'test') {
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

export const tabAdd = (tab: Tab): TabAction => ({
  type: 'TabAdd',
  payload: tab,
});

export const tabDel = (id: string): TabAction => ({
  type: 'TabDel',
  payload: id,
});

export const addHistory = (payload: string): ConsoleAction => ({
  type: 'ConsoleAddHistory',
  payload,
});

export const writeConsoleSettings = (
  payload: ConsoleSettingsUpdate
): ConsoleAction => ({ type: 'ConsoleWriteSettings', payload });

export const loadConsoleSettings = (
  payload: ConsoleSettings
): ConsoleAction => ({
  type: 'ConsoleLoadSettings',
  payload,
});

export const writeToken = (token: string): EmulatorAction => ({
  type: 'TokenWrite',
  payload: token,
});

export const loadToken = (token: string): EmulatorAction => ({
  type: 'TokenLoad',
  payload: token,
});
