import { AdbClientOptions, IAdbDevice } from 'adb-ts';
import {
  AdbRuntimeStatus,
  ConsoleSettings,
  ConsoleSettingsUpdate,
} from '../../shared';

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

export type AdbAction = Readonly<
  | { type: 'AdbSettingsLoad'; payload: AdbClientOptions }
  | { type: 'AdbSettingsWrite'; payload: AdbClientOptions }
  | { type: 'AdbStatus'; payload: AdbRuntimeStatus }
>;

export type DeviceAction = Readonly<
  | { type: 'DeviceAdd'; payload: IAdbDevice }
  | { type: 'DeviceChange'; payload: IAdbDevice }
  | { type: 'DeviceRemove'; payload: IAdbDevice }
  | { type: 'DeviceRemoveAll' }
>;

export type ConsoleAction = Readonly<
  | { type: 'ConsoleAddHistory'; payload: string }
  | { type: 'ConsoleLoadHistory'; payload: string[] }
  | { type: 'ConsoleLoadSettings'; payload: ConsoleSettings }
  | { type: 'ConsoleWriteHistoryLen'; payload: number }
  | { type: 'ConsoleWriteLines'; payload: number }
  | { type: 'ConsoleWriteSettings'; payload: ConsoleSettingsUpdate }
>;

export type TabAction = Readonly<
  { type: 'TabAdd'; payload: Tab } | { type: 'TabDel'; payload: string }
>;

export type EmulatorAction = Readonly<
  | { type: 'TokenLoad'; payload: string }
  | { type: 'TokenWrite'; payload: string }
>;

export type Actions =
  | DeviceAction
  | ConsoleAction
  | AdbAction
  | TabAction
  | EmulatorAction;
