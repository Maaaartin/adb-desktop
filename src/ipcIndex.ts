import { TypedIpcMain, TypedIpcRenderer } from 'electron-typed-ipc';
import { ipcMain, ipcRenderer } from 'electron';

import { Dictionary } from 'lodash';
import { FileSystemData } from './shared';

export type CommandResponse<T> = {
  error?: Error;
  output?: T;
};

type GetCallback = (serial: string) => CommandResponse<Dictionary<any>>;

export type Events = {
  displayError: (msg: string) => void;
  /**
   * open
   */
  openAdbShell: (serial: string) => void;
  openAdb: () => void;
  openEmulator: (serial: string) => void;
};

export type Commands = {
  /**
   * exec
   */
  execDevice: (serial: string, cmd: string) => CommandResponse<string>;
  execAdb: (cmd: string) => CommandResponse<string>;
  execMonkey: (serial: string, cmd: string) => CommandResponse<string>;
  execEmulator: (serial: string, cmd: string) => CommandResponse<string>;
  /**
   * get
   */
  getBattery: GetCallback;
  getProps: GetCallback;
  getSettingsGlobal: GetCallback;
  getSettingsSecure: GetCallback;
  getSettingsSystem: GetCallback;
  getFeatures: GetCallback;
  getPackages: (serial: string) => CommandResponse<string[]>;
  getFiles: (serial: string, path: string) => CommandResponse<FileSystemData>;
};

export const typedIpcMain = ipcMain as TypedIpcMain<Events, Commands>;
export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<
  Events,
  Commands
>;
