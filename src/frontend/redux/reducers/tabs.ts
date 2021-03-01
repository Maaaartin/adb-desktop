import { clone } from 'lodash';
import { Action } from ".";
import { Tab } from '../actions';
import { TAB_ADD, TAB_DEL } from "../actionTypes";

const initialState: { list: Tab[] } = {
  list: []
};

export default function (state = initialState, action: Action) {
  const list = clone(state.list);
  switch (action.type) {
    case TAB_ADD: {
      const { payload } = action;
      payload.id = payload.id || Math.random().toString(36).substring(7);
      list.push(action.payload);
      return {
        ...state,
        list: list
      };
    }
    case TAB_DEL: {
      const match = list.find((tab) => tab.id === action.payload);
      if (match) list.splice(list.indexOf(match), 1);
      return {
        ...state,
        list: list
      };
    }
    default:
      return state;
  }
}
