import { TypedIpcMain, TypedIpcRenderer } from 'electron-typed-ipc';
import { ipcMain, ipcRenderer } from 'electron';

import { Dictionary } from 'lodash';
import { FileSystemData } from './shared';
import { SimpleType } from 'adb-ts';

export type CommandResponse<T = void> = {
  error?: Error | null;
  output?: T;
};

type GetCallback = (serial: string) => CommandResponse<Dictionary<any>>;

type GetItemCallback = (serial: string, key: string) => CommandResponse<any>;

type SetCallback = (
  serial: string,
  key: string,
  value: SimpleType
) => CommandResponse;

export type Events = {
  displayError: (err?: Error | null) => void;
  toggleAdb: VoidFunction;
  /**
   * open
   */
  openAdbShell: (serial: string) => void;
  openAdb: () => void;
  openEmulator: (serial: string) => void;
  openLink: (link: string) => void;
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
  getSettingGlobal: GetItemCallback;
  getSettingSecure: GetItemCallback;
  getSettingSystem: GetItemCallback;
  getProp: GetItemCallback;

  /**
   * put - set
   */
  putSettingSystem: SetCallback;
  putSettingGlobal: SetCallback;
  putSettingSecure: SetCallback;
  setProp: SetCallback;

  /**
   * other
   */
  renewToken: () => CommandResponse<string>;
};

export const typedIpcMain = ipcMain as TypedIpcMain<Events, Commands>;
export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<
  Events,
  Commands
>;
