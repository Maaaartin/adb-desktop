import {
  ADD_HISTORY,
  LOAD_CONSOLE_SETTINGS,
  LOAD_HISTORY,
  WRITE_CONSOLE_SETTINGS,
  WRITE_HISTORY_LEN,
  WRITE_LINES,
} from '../actionTypes';
import { Dictionary, clone, without } from 'lodash';

import { Action } from '.';
import { List } from 'immutable';

type State = {
  lines: number;
  historyLen: number;
  history: List<string>;
};

const initialState: State = {
  lines: 500,
  history: List(),
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
        history: List(history || state.history),
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
      // let history = clone(state.history || []);
      const { payload } = action as { payload: string };

      ///
      const { history, historyLen } = state;
      const tmp = List(
        history
          .reduceRight(
            (red, value, i) => {
              if (i < historyLen && value !== payload) {
                red.push(value);
              }
              return red;
            },
            [payload]
          )
          .reverse()
      );
      ///

      // const index = history.indexOf(payload);
      // if (index > -1) {
      //   history.splice(index, 1);
      // }
      // history.push(payload);
      // if (history.length > state.historyLen) {
      //   const diff = history.length - state.historyLen;
      //   history = history.slice(diff);
      // }
      return {
        ...state,
        history: tmp,
      };
    }
    case LOAD_HISTORY: {
      return {
        ...state,
        history: List(action.payload as string[]),
      };
    }
    default:
      return state;
  }
}
