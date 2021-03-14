import { Reducer, ReducerAction } from 'react';
import { reducer as notifications } from 'react-notification-system-redux';
import { combineReducers } from 'redux';
import adb from './adb';
import console from './console';
import devices from './devices';
import emulator from './emulator';
import tabs from './tabs';

const reducers = combineReducers({
  devices,
  tabs,
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
