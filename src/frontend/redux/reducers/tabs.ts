import { List, Record } from 'immutable';
import { TAB_ADD, TAB_DEL, TabAction } from '../actionTypes';

import { Action } from '.';
import { Tab } from '../actions';
import { clone } from 'lodash';

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
    case 'Add': {
      return state.update('list', (list) => {
        const { payload } = action;
        payload.id = payload.id || Math.random().toString(36).substring(7);
        return list.concat(payload);
      });
    }
    case 'Del': {
      return state.update('list', (list) =>
        list.filter((tab) => tab.id != action.payload)
      );
    }
  }
}
