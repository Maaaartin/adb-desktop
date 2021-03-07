import { Action } from '.';
import {
  ADB_SETTINGS_LOAD,
  ADB_SETTINGS_WRITE,
  LOAD_CONSOLE_SETTINGS,
  LOAD_TOKEN,
  WRITE_CONSOLE_SETTINGS,
  WRITE_TOKEN,
} from '../actionTypes';

const initialState = {
  adb: {},
  token: '',
  console: { lines: 500 },
};

export default function (state = initialState, action: Action) {
  switch (action.type) {
    case ADB_SETTINGS_LOAD:
    case ADB_SETTINGS_WRITE: {
      return {
        ...state,
        adb: action.payload,
      };
    }
    case WRITE_TOKEN:
    case LOAD_TOKEN: {
      return {
        ...state,
        token: action.payload,
      };
    }
    case LOAD_CONSOLE_SETTINGS:
    case WRITE_CONSOLE_SETTINGS: {
      let { lines } = action.payload;
      if (!lines || lines < 0 || lines > 2000) lines = 500;
      const consoleSett = { ...state.console, lines };
      return {
        ...state,
        console: consoleSett,
      };
    }
    default:
      return state;
  }
}
