import {
  ConsoleAT,
  ConsoleAction,
  DeviceAT,
  DeviceAction,
} from '../actionTypes';
import { ConsoleSettings, ConsoleSettingsUpdate } from '../../../shared';

import { IAdbDevice } from 'adb-ts';
import Notifications from 'react-notification-system-redux';
import { typedIpcRenderer as ipc } from '../../../ipcIndex';
import store from '../store';

const SettingsAction = Notifications.success({ title: 'Settings saved' });

export const writeSettings = (data: ConsoleSettingsUpdate): ConsoleAction => {
  if (process.env.NODE_ENV != 'test') {
    ipc.send('writeConsoleSettings', data);
  }
  store.dispatch(SettingsAction);
  return {
    type: ConsoleAT.WriteSettings,
    payload: data,
  };
};

export const addHistory = (content: string): ConsoleAction => ({
  type: ConsoleAT.AddHistory,
  payload: content,
});

export const LoadSettings = (content: ConsoleSettings): ConsoleAction => ({
  type: ConsoleAT.LoadSettings,
  payload: content,
});
