import { ipcRenderer as ipc } from 'electron';
import { Dictionary } from 'lodash';
import {
  SET_PROP,
  PUT_SETTING_GLOBAL,
  PUT_SETTING_SECURE,
  PUT_SETTING_SYSTEM,
} from '../../constants';

const setterCalls: Dictionary<((error: Error) => void) | undefined> = {};

const hookSetter = (cb?: (error: Error) => void) => {
  const id = Math.random().toString(36).substring(7);
  setterCalls[id] = cb;
  return id;
};

const handleSetterResponse = (data: any) => {
  const { id, error } = data;
  setterCalls[id]?.(error);
  delete setterCalls[id];
};

ipc.on(SET_PROP, (event, data) => {
  handleSetterResponse(data);
});

ipc.on(PUT_SETTING_GLOBAL, (event, data) => {
  handleSetterResponse(data);
});

ipc.on(PUT_SETTING_SYSTEM, (event, data) => {
  handleSetterResponse(data);
});

ipc.on(PUT_SETTING_SECURE, (event, data) => {
  handleSetterResponse(data);
});

export const setProp = (
  serial: string,
  key: string,
  value: string,
  cb?: (error: Error) => void
) => {
  const id = hookSetter(cb);
  ipc.send(SET_PROP, { id, serial, key, value });
};

export const putSettingGlobal = (
  serial: string,
  key: string,
  value: string,
  cb?: (error: Error) => void
) => {
  const id = hookSetter(cb);
  ipc.send(PUT_SETTING_GLOBAL, { id, serial, key, value });
};

export const putSettingSecure = (
  serial: string,
  key: string,
  value: string,
  cb?: (error: Error) => void
) => {
  const id = hookSetter(cb);
  ipc.send(PUT_SETTING_SECURE, { id, serial, key, value });
};

export const putSettingSystem = (
  serial: string,
  key: string,
  value: string,
  cb?: (error: Error) => void
) => {
  const id = hookSetter(cb);
  ipc.send(PUT_SETTING_SYSTEM, { id, serial, key, value });
};
