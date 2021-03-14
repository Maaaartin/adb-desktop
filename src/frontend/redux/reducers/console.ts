import { clone, Dictionary } from 'lodash';
import { Action } from '.';
import {
  LOAD_CONSOLE_SETTINGS,
  WRITE_CONSOLE_SETTINGS,
  WRITE_LINES,
  ADD_HISTORY,
  LOAD_HISTORY,
  WRITE_HISTORY_LEN,
} from '../actionTypes';

type State = { lines: number; history: string[]; historyLen: number };

const initialState: State = {
  lines: 500,
  history: [],
  historyLen: 20,
};

function trimHistory(historyLen: number) {
  if (!historyLen || historyLen < 0 || historyLen > 100) return 20;
  return historyLen;
}

function trimLines(lines: number) {
  if (!lines || lines < 0 || lines > 2000) return 500;
  return lines;
}

export default function (
  state = initialState,
  action: Action<Dictionary<any> | number | string[] | string>
): State {
  switch (action.type) {
    case LOAD_CONSOLE_SETTINGS:
    case WRITE_CONSOLE_SETTINGS: {
      let { lines, history, historyLen } = action.payload as Dictionary<any>;
      return {
        ...state,
        lines: lines || state.lines,
        history: history || state.history,
        historyLen: historyLen || state.historyLen,
      };
    }
    case WRITE_HISTORY_LEN: {
      return {
        ...state,
        historyLen: trimHistory(action.payload as number),
      };
    }
    case WRITE_LINES: {
      return {
        ...state,
        lines: trimLines(action.payload as number),
      };
    }
    case ADD_HISTORY: {
      let history = clone(state.history || []);
      const { payload } = action as { payload: string };
      const index = history.indexOf(payload);
      if (index > -1) {
        history.splice(index, 1);
      }
      history.push(payload);
      if (history.length > state.historyLen) {
        const diff = history.length - state.historyLen;
        console.log(diff);
        console.log(history.slice(diff));
        history = history.slice(diff);
      }
      return {
        ...state,
        history,
      };
    }
    case LOAD_HISTORY: {
      return {
        ...state,
        history: action.payload as string[],
      };
    }
    default:
      return state;
  }
}
