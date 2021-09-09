import { List, Record } from 'immutable';

import { ConsoleAction } from '../actionTypes';

type ConsoleStateProps = {
  lines: number;
  historyLen: number;
  history: List<string>;
};

export type ConsoleState = Record<ConsoleStateProps> &
  Readonly<ConsoleStateProps>;

export const ConsoleStateConstructor = Record<ConsoleStateProps>({
  lines: 20,
  historyLen: 500,
  history: List<string>(),
});

export default function (
  state = ConsoleStateConstructor(),
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
      const { historyLen } = state;
      return state.update('history', (prev) =>
        prev.update((t) => {
          const index = t.indexOf(action.payload);
          if (index > -1) {
            t = t.remove(index);
          }
          const i = t.count() + 1 - historyLen;
          return t.skip(i).push(action.payload);
        })
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
