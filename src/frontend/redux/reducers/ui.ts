import { List, Record } from 'immutable';

import { Tab } from '../actions';
import { UiAction } from '../actionTypes';

export type UiStateProps = {
  tabs: List<Tab>;
  hide: boolean;
};

export type UiState = Record<UiStateProps> & Readonly<UiStateProps>;

export const UiStateConstructor = Record<UiStateProps>({
  tabs: List(),
});

export default function (
  state = UiStateConstructor(),
  action: UiAction
): UiState {
  switch (action.type) {
    case 'TabAdd': {
      const red = state.update('tabs', (list) => {
        const { payload } = action;
        return list.concat(payload);
      });
      return red;
    }
    case 'TabDel': {
      return state.update('tabs', (list) =>
        list.filter((tab) => tab.id != action.payload)
      );
    }

    default:
      return state;
  }
}
