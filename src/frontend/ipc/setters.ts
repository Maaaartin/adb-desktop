import {
  PUT_SETTING_GLOBAL,
  PUT_SETTING_SECURE,
  PUT_SETTING_SYSTEM,
  SET_PROP,
} from '../../constants';

import { Dictionary } from 'lodash';
import { ipcRenderer as ipc } from 'electron';

const setterCalls: Dictionary<((error: Error) => void) | undefined> = {};

const handleSetterResponse = (data: any) => {
  const { id, error } = data;

  setterCalls[id]?.(error);
  delete setterCalls[id];
};

ipc.on(SET_PROP, (_e, data) => {
  handleSetterResponse(data);
});

ipc.on(PUT_SETTING_GLOBAL, (_e, data) => {
  handleSetterResponse(data);
});

ipc.on(PUT_SETTING_SYSTEM, (_e, data) => {
  handleSetterResponse(data);
});

ipc.on(PUT_SETTING_SECURE, (_e, data) => {
  handleSetterResponse(data);
});

// export const setProp = (
//   serial: string,
//   key: string,
//   value: string,
//   cb?: (error: Error) => void
// ) => {
//   const id = hookSetter(cb);
//   ipc.send(SET_PROP, { id, serial, key, value });
// };

// export const putSettingGlobal = (
//   serial: string,
//   key: string,
//   value: string,
//   cb?: (error: Error) => void
// ) => {
//   const id = hookSetter(cb);
//   ipc.send(PUT_SETTING_GLOBAL, { id, serial, key, value });
// };

// export const putSettingSecure = (
//   serial: string,
//   key: string,
//   value: string,
//   cb?: (error: Error) => void
// ) => {
//   const id = hookSetter(cb);
//   ipc.send(PUT_SETTING_SECURE, { id, serial, key, value });
// };

// export const putSettingSystem = (
//   serial: string,
//   key: string,
//   value: string,
//   cb?: (error: Error) => void
// ) => {
//   const id = hookSetter(cb);
//   ipc.send(PUT_SETTING_SYSTEM, { id, serial, key, value });
// };
