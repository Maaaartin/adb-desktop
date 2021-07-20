import {
  GET_BATTERY,
  GET_DIR,
  GET_FEATURES,
  GET_PACKAGES,
  GET_PROPS,
  GET_SETTINGS,
  GET_SETTINGS_GLOBAL,
  GET_SETTINGS_SECURE,
  GET_SETTINGS_SYSTEM,
  GET_SETTING_GLOBAL,
  GET_SETTING_SECURE,
  GET_SETTING_SYSTEM,
} from '../../constants';

import { Dictionary } from 'lodash';
import { ipcRenderer as ipc } from 'electron';

const getterCalls: Dictionary<
  ((error: Error, output: any) => void) | undefined
> = {};

const handleGetterResponse = (data: any) => {
  const { output, id, error } = data;
  getterCalls[id]?.(error, output);
  delete getterCalls[id];
};

ipc.on(GET_BATTERY, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_SETTINGS, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_SETTINGS_GLOBAL, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_SETTINGS_SECURE, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_SETTINGS_SYSTEM, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_PROPS, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_FEATURES, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_PACKAGES, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_SETTING_GLOBAL, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_SETTING_SECURE, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_SETTING_SYSTEM, (_e, data) => {
  handleGetterResponse(data);
});

ipc.on(GET_DIR, (_e, data) => {
  handleGetterResponse(data);
});

// export const getBattery = (
//   serial: string,+++
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_BATTERY, { id, serial });
// };

// export const getProps = (
//   serial: string,
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_PROPS, { id, serial });
// };

// export const getSettings = (
//   serial: string,
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_SETTINGS, { id, serial });
// };

// export const getSettingsSystem = (
//   serial: string,
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_SETTINGS_SYSTEM, { id, serial });
// };

// export const getSettingsGlobal = (
//   serial: string,
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_SETTINGS_GLOBAL, { id, serial });
// };

// export const getSettingsSecure = (
//   serial: string,
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_SETTINGS_SECURE, { id, serial });
// };

// export const getFeatures = (
//   serial: string,
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_FEATURES, { id, serial });
// };

// export const getPackages = (
//   serial: string,
//   cb?: (error: Error, output: string[]) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_PACKAGES, { id, serial });
// };

// export const getSettingSystem = (
//   serial: string,
//   key: string,
//   cb?: (error: Error, output: any) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_SETTING_SYSTEM, { id, serial, key });
// };

// export const getSettingGlobal = (
//   serial: string,
//   key: string,
//   cb?: (error: Error, output: any) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_SETTING_GLOBAL, { id, serial, key });
// };

// export const getSettingSecure = (
//   serial: string,
//   key: string,
//   cb?: (error: Error, output: any) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_SETTING_SECURE, { id, serial, key });
// };

// export const getProp = (
//   serial: string,
//   key: string,
//   cb?: (error: Error, output: Dictionary<any>) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_PROP, { id, serial, key });
// };

// export const getFiles = (
//   serial: string,
//   path: string,
//   cb?: (error: Error, output: FileSystemData) => void
// ) => {
//   const id = hookGetter(cb);
//   ipc.send(GET_DIR, { id, serial, path });
// };
