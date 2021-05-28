import { TypedIpcMain, TypedIpcRenderer } from 'electron-typed-ipc';
import { ipcMain, ipcRenderer } from 'electron';

export type CommandResponse<T> = {
  error?: Error;
  output: T;
};

export type Events = {
  displayError: (msg: string) => void;
  openAdbShell: (serial: string) => void;
  openAdb: () => void;
  openEmulator: (serial: string) => void;
};

export type Commands = {
  execDevice: (serial: string, cmd: string) => CommandResponse<string>;
  execAdb: (cmd: string) => CommandResponse<string>;
  execMonkey: (serial: string, cmd: string) => CommandResponse<string>;
  execEmulator: (serial: string, cmd: string) => CommandResponse<string>;
};

export const typedIpcMain = ipcMain as TypedIpcMain<Events, Commands>;
export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<
  Events,
  Commands
>;
