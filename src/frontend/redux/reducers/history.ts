import { clone } from "lodash";
import { Action } from ".";
import { ADD_HISTORY, LOAD_HISTORY } from "../actionTypes";

const initialState: { list: string[] } = {
  list: []
};

export default function (state = initialState, action: Action<string>) {
  switch (action.type) {
    case ADD_HISTORY: {
      const list = clone(state.list);
      const { payload } = action;
      const index = list.indexOf(payload);
      if (index > -1) {
        list.splice(index, 1);
      }
      list.push(action.payload);
      if (list.length > 20) {
        list.shift();
      }
      return {
        ...state,
        list
      };
    }
    case LOAD_HISTORY: {
      return {
        ...state,
        list: action.payload
      };
    }
    default:
      return state;
  }
}
