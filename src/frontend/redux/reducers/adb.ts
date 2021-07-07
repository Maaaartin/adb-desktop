import {
  ADB_SETTINGS_LOAD,
  ADB_SETTINGS_WRITE,
  ADB_STATUS,
} from '../actionTypes';

import { Action } from '.';
import { AdbClientOptions } from 'adb-ts';
import { AdbStatus } from '../../../shared';

type State = { status: AdbStatus; settings: AdbClientOptions };

const initialState: State = {
  status: {
    running: false,
    status: 'stopped',
    error: null,
  },
  settings: {},
};

export default function (
  state = initialState,
  action: Action<AdbStatus | AdbClientOptions>
): State {
  switch (action.type) {
    case ADB_STATUS: {
      return {
        ...state,
        status: action.payload as AdbStatus,
      };
    }
    case ADB_SETTINGS_LOAD:
    case ADB_SETTINGS_WRITE: {
      return { ...state, settings: action.payload as AdbClientOptions };
    }
    default:
      return state;
  }
}
