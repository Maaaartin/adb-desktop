import { clone, Dictionary } from 'lodash';
import { Action } from '.';
import {
  LOAD_CONSOLE_SETTINGS,
  WRITE_CONSOLE_SETTINGS,
  WRITE_LINES,
  ADD_HISTORY,
  LOAD_HISTORY,
} from '../actionTypes';

type State = { lines: number; history: string[] };

const initialState: State = {
  lines: 500,
  history: [],
};

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
      let { lines, history } = action.payload as Dictionary<any>;
      return {
        ...state,
        lines: trimLines(lines),
        history,
      };
    }
    case WRITE_LINES: {
      return {
        ...state,
        lines: trimLines(action.payload as number),
      };
    }
    case ADD_HISTORY: {
      const history = clone(state.history || []);
      const { payload } = action as { payload: string };
      const index = history.indexOf(payload);
      if (index > -1) {
        history.splice(index, 1);
      }
      history.push(payload);
      if (history.length > 20) {
        history.shift();
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
