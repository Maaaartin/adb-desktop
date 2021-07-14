import {
  ADD_HISTORY,
  ConsoleAction,
  LOAD_CONSOLE_SETTINGS,
  WRITE_CONSOLE_SETTINGS,
} from '../actionTypes';
import { List, Record } from 'immutable';

import { Dictionary } from 'lodash';

type ConsoleStateProps = {
  lines: number;
  historyLen: number;
  history: List<string>;
};

export type ConsoleState = Record<ConsoleStateProps> &
  Readonly<ConsoleStateProps>;

const StateConstructor = Record<ConsoleStateProps>({
  lines: 20,
  historyLen: 500,
  history: List<string>(),
});

export default function (
  state = StateConstructor(),
  action: ConsoleAction
): ConsoleState {
  switch (action.type) {
    case 'LoadSettings':
    case 'WriteSettings': {
      let { lines, history, historyLen } = action.payload;
      return state
        .update('lines', (prev) => lines || prev)
        .update('history', (prev) => prev.clear().concat(history || prev))
        .update('historyLen', (prev) => historyLen || prev);
    }

    case 'AddHistory': {
      const { historyLen, history } = state;
      return state.update('history', (prev) =>
        prev
          .remove(history.indexOf(action.payload))
          .skipUntil(
            (_value, key, history) => key < history.count() - historyLen
          )
          .push(action.payload)
      );
    }
    case 'LoadHistory': {
      return state.update('history', (history) =>
        history.clear().concat(action.payload)
      );
    }
    case 'WriteLines': {
      return state.update('lines', () => action.payload);
    }
    case 'WriteHistoryLen':
      return state.update('historyLen', () => action.payload);
  }
}
