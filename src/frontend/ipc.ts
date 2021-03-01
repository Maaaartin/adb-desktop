import { ipcRenderer as ipc } from 'electron';
import { Dictionary } from 'lodash';
import {
  EXEC_ADB,
  GET_BATTERY,
  EXEC_DEVICE,
  EXEC_EMULATOR,
  EXEC_MONKEY,
  OPEN_ADB,
  OPEN_ADB_SHELL,
  OPEN_EMULATOR,
  SAVE_HISTORY,
  GET_PROPS,
  GET_SETTINGS,
  GET_FEATURES,
  GET_PACKAGES,
  GET_SETTINGS_SYSTEM,
  GET_SETTINGS_GLOBAL,
  GET_SETTINGS_SECURE,
  TOGGLE_ADB,
} from '../constants';

const execCalls: Dictionary<
  ((error: Error, output: string) => void) | undefined
> = {};
const getCalls: Dictionary<
  ((error: Error, output: any) => void) | undefined
> = {};

const handleExecResponse = (data: any) => {
  const { output, id, error } = data;
  if (execCalls[id]) {
    execCalls[id]?.(error, output);
    delete execCalls[id];
  }
};

const handleGetResponse = (data: any) => {
  const { output, id, error } = data;
  if (getCalls[id]) {
    getCalls[id]?.(error, output);
    delete getCalls[id];
  }
};

ipc.on(EXEC_DEVICE, (event, data) => {
  handleExecResponse(data);
});

ipc.on(EXEC_ADB, (event, data) => {
  handleExecResponse(data);
});

ipc.on(EXEC_MONKEY, (event, data) => {
  handleExecResponse(data);
});

ipc.on(EXEC_EMULATOR, (event, data) => {
  handleExecResponse(data);
});

ipc.on(GET_BATTERY, (event, data) => {
  handleGetResponse(data);
});

ipc.on(GET_SETTINGS, (event, data) => {
  handleGetResponse(data);
});

ipc.on(GET_SETTINGS_GLOBAL, (event, data) => {
  handleGetResponse(data);
});

ipc.on(GET_SETTINGS_SECURE, (event, data) => {
  handleGetResponse(data);
});

ipc.on(GET_SETTINGS_SYSTEM, (event, data) => {
  handleGetResponse(data);
});

ipc.on(GET_PROPS, (event, data) => {
  handleGetResponse(data);
});

ipc.on(GET_FEATURES, (event, data) => {
  handleGetResponse(data);
});

ipc.on(GET_PACKAGES, (event, data) => {
  handleGetResponse(data);
});

const hookExec = (cb?: (error: Error, output: string) => void) => {
  const id = Math.random().toString(36).substring(7);
  execCalls[id] = cb;
  return id;
};

const hookGet = (cb?: (error: Error, output: any) => void) => {
  const id = Math.random().toString(36).substring(7);
  getCalls[id] = cb;
  return id;
};

export const execAdbDevice = (
  serial: string,
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_DEVICE, { cmd, serial, id });
};

export const execAdb = (
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_ADB, { cmd, id });
};

export const execMonkey = (
  serial: string,
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_MONKEY, { cmd, id, serial });
};

export const execEmulator = (
  serial: string,
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_EMULATOR, { cmd, id, serial });
};

export const getBattery = (
  serial: string,
  cb?: (error: Error, output: Dictionary<any>) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_BATTERY, { id, serial });
};

export const getProps = (
  serial: string,
  cb?: (error: Error, output: Dictionary<any>) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_PROPS, { id, serial });
};

export const getSettings = (
  serial: string,
  cb?: (error: Error, output: Dictionary<any>) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_SETTINGS, { id, serial });
};

export const getSettingsSystem = (
  serial: string,
  cb?: (error: Error, output: Dictionary<any>) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_SETTINGS_SYSTEM, { id, serial });
};

export const getSettingsGlobal = (
  serial: string,
  cb?: (error: Error, output: Dictionary<any>) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_SETTINGS_GLOBAL, { id, serial });
};

export const getSettingsSecure = (
  serial: string,
  cb?: (error: Error, output: Dictionary<any>) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_SETTINGS_SECURE, { id, serial });
};

export const getFeatures = (
  serial: string,
  cb?: (error: Error, output: Dictionary<any>) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_FEATURES, { id, serial });
};

export const getPackages = (
  serial: string,
  cb?: (error: Error, output: string[]) => void
) => {
  const id = hookGet(cb);
  ipc.send(GET_PACKAGES, { id, serial });
};

export const openAdbShell = (id: string) => ipc.send(OPEN_ADB_SHELL, id);

export const openAdb = () => ipc.send(OPEN_ADB);

export const openEmulator = (id: string) => ipc.send(OPEN_EMULATOR, id);

export const saveHistory = (history: string[]) => {
  ipc.send(SAVE_HISTORY, history);
};

export const toggleAdb = () => {
  ipc.send(TOGGLE_ADB);
};
