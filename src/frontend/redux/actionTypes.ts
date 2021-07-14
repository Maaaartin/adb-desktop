import { AdbClientOptions, IAdbDevice } from 'adb-ts';
import {
  AdbRuntimeStatus,
  AdbState,
  ConsoleSettings,
  ConsoleSettingsUpdate,
} from '../../shared';

import { Action } from 'redux';
import { Dictionary } from 'lodash';
import { Tab } from './actions';

export const ADB_SETTINGS_LOAD = 'ADB_SETTINGS_LOAD';
export const ADB_SETTINGS_WRITE = 'ADB_SETTINGS_WRITE';

export const DEVICE_ADD = 'DEVICE_ADD';
export const DEVICE_CHANGE = 'DEVICE_CHANGE';
export const DEVICE_REMOVE = 'DEVICE_REMOVE';
export const DEVICE_REMOVE_ALL = 'DEVICE_REMOVE_ALL';

export const TAB_ADD = 'TAB_ADD';
export const TAB_DEL = 'TAB_DEL';

export const LOAD_TOKEN = 'LOAD_TOKEN';
export const WRITE_TOKEN = 'WRITE_TOKEN';

export const WRITE_CONSOLE_SETTINGS = 'WRITE_CONSOLE_SETTINGS';
export const LOAD_CONSOLE_SETTINGS = 'LOAD_CONSOLE_SETTINGS';
export const ADD_HISTORY = 'ADD_HISTORY';
export const WRITE_LINES = 'WRITE_LINES';
export const WRITE_HISTORY_LEN = 'WRITE_HISTORY_LEN';
export const LOAD_HISTORY = 'LOAD_HISTORY';

export const ADB_STATUS = 'ADB_STATUS';

// export enum DeviceAT {
//   Add = 'DEVICE_ADD',
//   Change = 'DEVICE_CHANGE',
//   Remove = 'DEVICE_REMOVE',
//   RemoveAll = 'DEVICE_REMOVE_ALL',
// }

// export enum ConsoleAT {
//   WriteSettings = 'WRITE_CONSOLE_SETTINGS',
//   LoadSettings = 'LOAD_CONSOLE_SETTINGS',
//   AddHistory = 'ADD_HISTORY',
//   // WriteLines = 'WRITE_LINES',
//   // WriteHistoryLen = 'WRITE_HISTORY_LEN',
//   // LoadHistory = 'LOAD_HISTORY',
// }

// export enum AdbAT {
//   SettingsLoad = 'ADB_SETTINGS_LOAD',
//   SettingsWrite = 'ADB_SETTINGS_WRITE',
//   Status = 'ADB_STATUS',
// }

export type AdbAction = Readonly<
  | { type: 'SettingsLoad'; payload: AdbClientOptions }
  | { type: 'SettingsWrite'; payload: AdbClientOptions }
  | { type: 'Status'; payload: AdbRuntimeStatus }
>;

export type DeviceAction = Readonly<
  | { type: 'Add'; payload: IAdbDevice }
  | { type: 'Change'; payload: IAdbDevice }
  | { type: 'Remove'; payload: IAdbDevice }
  | { type: 'RemoveAll' }
>;

export type ConsoleAction = Readonly<
  | { type: 'AddHistory'; payload: string }
  | { type: 'LoadHistory'; payload: string[] }
  | { type: 'LoadSettings'; payload: ConsoleSettings }
  | { type: 'WriteHistoryLen'; payload: number }
  | { type: 'WriteLines'; payload: number }
  | { type: 'WriteSettings'; payload: ConsoleSettingsUpdate }
>;

export type TabAction = Readonly<
  { type: 'Add'; payload: Tab } | { type: 'Del'; payload: string }
>;

export type EmulatorAction = Readonly<
  { type: 'Load'; payload: string } | { type: 'Write'; payload: string }
>;

export type Actions =
  | DeviceAction
  | ConsoleAction
  | AdbAction
  | TabAction
  | EmulatorAction;
