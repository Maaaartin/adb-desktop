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
