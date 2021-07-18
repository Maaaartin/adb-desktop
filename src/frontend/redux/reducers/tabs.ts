import { List, Record } from 'immutable';

import { Tab } from '../actions';
import { TabAction } from '../actionTypes';

export type TabsStateProps = {
  list: List<Tab>;
};

export type TabsState = Record<TabsStateProps> & Readonly<TabsStateProps>;

const StateConstructor = Record<TabsStateProps>({
  list: List(),
});

export default function (
  state = StateConstructor(),
  action: TabAction
): TabsState {
  switch (action.type) {
    case 'TabAdd': {
      const red = state.update('list', (list) => {
        const { payload } = action;
        return list.concat(payload);
      });
      console.log(red);
      return red;
    }
    case 'TabDel': {
      return state.update('list', (list) =>
        list.filter((tab) => tab.id != action.payload)
      );
    }
    default:
      return state;
  }
}
