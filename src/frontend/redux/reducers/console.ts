import { List, Record } from 'immutable';

import { ConsoleAction } from '../actionTypes';

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
    case 'ConsoleLoadSettings':
    case 'ConsoleWriteSettings': {
      let { lines, history, historyLen } = action.payload;
      return state
        .update('lines', (prev) => lines || prev)
        .update('history', (prev) => prev.clear().concat(history || prev))
        .update('historyLen', (prev) => historyLen || prev);
    }

    case 'ConsoleAddHistory': {
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
    case 'ConsoleLoadHistory': {
      return state.update('history', (history) =>
        history.clear().concat(action.payload)
      );
    }
    case 'ConsoleWriteLines': {
      return state.update('lines', () => action.payload);
    }
    case 'ConsoleWriteHistoryLen':
      return state.update('historyLen', () => action.payload);
    default:
      return state;
  }
}
