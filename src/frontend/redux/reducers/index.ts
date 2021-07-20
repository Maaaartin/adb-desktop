import { Reducer, ReducerAction } from 'react';

import adb from './adb';
import { combineReducers } from 'redux';
import console from './console';
import devices from './devices';
import emulator from './emulator';
import { reducer as notifications } from 'react-notification-system-redux';
import ui from './ui';

const reducers = combineReducers({
  ui,
  devices,
  console,
  emulator,
  adb,
  notifications,
});

export default reducers;

export type Action<T = any> = ReducerAction<
  Reducer<Record<string, any>, { type: string; payload: T }>
>;

export type GlobalState = ReturnType<typeof reducers>;
