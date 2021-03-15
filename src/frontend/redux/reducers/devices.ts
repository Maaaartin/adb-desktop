import { IAdbDevice } from 'adb-ts';
import { clone } from 'lodash';
import { Action } from '.';
import { DEVICE_ADD, DEVICE_CHANGE, DEVICE_REMOVE } from '../actionTypes';

type State = { list: IAdbDevice[] };

const initialState: State = {
  list: [],
};

export default function (
  state = initialState,
  action: Action<IAdbDevice>
): State {
  const list = clone(state.list);
  switch (action.type) {
    case DEVICE_ADD: {
      list.push(action.payload);
      return {
        ...state,
        list,
      };
    }
    case DEVICE_CHANGE: {
      let index = list.findIndex((d) => d.id === action.payload.id);
      if (index > -1) {
        list[index] = action.payload;
      }
      return {
        ...state,
        list,
      };
    }
    case DEVICE_REMOVE: {
      list.splice(
        list.findIndex((d) => d.id === action.payload.id),
        1
      );
      return {
        ...state,
        list,
      };
    }
    default:
      return state;
  }
}
