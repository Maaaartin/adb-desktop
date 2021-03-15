import { AdbClientOptions, IAdbDevice } from 'adb-ts';
import { ipcRenderer as ipc } from 'electron';
import { Dictionary } from 'lodash';
import {
  ADB_SETTINGS_LOAD,
  ADB_SETTINGS_WRITE,
  ADB_STATUS,
  ADD_HISTORY,
  DEVICE_ADD,
  DEVICE_CHANGE,
  DEVICE_REMOVE,
  LOAD_CONSOLE_SETTINGS,
  LOAD_TOKEN,
  TAB_ADD,
  TAB_DEL,
  WRITE_CONSOLE_SETTINGS,
  WRITE_TOKEN,
} from './actionTypes';

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

export type AdbState = 'starting' | 'running' | 'stopped' | 'error';

export type AdbStatus = {
  status: AdbState;
  running: boolean;
  error: Error | null;
};

export const loadAdbSettings = (content: AdbClientOptions) => ({
  type: ADB_SETTINGS_LOAD,
  payload: content,
});

export const writeAdbSettings = (data: AdbClientOptions) => {
  ipc.send(ADB_SETTINGS_WRITE, data);
  return {
    type: ADB_SETTINGS_WRITE,
    payload: data,
  };
};

export const deviceAdd = (content: IAdbDevice) => ({
  type: DEVICE_ADD,
  payload: content,
});

export const deviceChange = (content: IAdbDevice) => ({
  type: DEVICE_CHANGE,
  payload: content,
});

export const deviceRemove = (content: IAdbDevice) => ({
  type: DEVICE_REMOVE,
  payload: content,
});

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

export const loadToken = (token: string) => ({
  type: LOAD_TOKEN,
  payload: token,
});

export const writeToken = (token: string) => {
  ipc.send(WRITE_TOKEN, token);
  return {
    type: LOAD_TOKEN,
    payload: token,
  };
};

export const setAdbStatus = (data: AdbStatus) => ({
  type: ADB_STATUS,
  payload: data,
});

export const writeConsoleSettings = (data: Dictionary<any>) => {
  ipc.send(WRITE_CONSOLE_SETTINGS, data);
  return {
    type: WRITE_CONSOLE_SETTINGS,
    payload: data,
  };
};

export const loadConsoleSettings = (data: Dictionary<any>) => ({
  type: LOAD_CONSOLE_SETTINGS,
  payload: data,
});
