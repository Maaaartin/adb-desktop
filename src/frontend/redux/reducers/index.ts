import { Reducer, ReducerAction } from "react";
import { combineReducers } from "redux";
import settings from "./settings";
import devices from './devices';
import tabs from './tabs';
import history from './history';
import adb from './adb';

export default combineReducers({ settings, devices, tabs, history, adb });
export type Action<T = any> = ReducerAction<Reducer<Record<string, any>, { type: string, payload: T }>>;
export type ConsoleCommand = { id: string, cmd: string, output?: string };
