import AdbDevice from "adb-ts/lib/device";
import { clone } from "lodash";
import { Action } from ".";
import { AdbState } from "../actions";
import { ADB_STATUS, DEVICE_CHANGE } from "../actionTypes";

const initialState: { list: AdbDevice[] } = {
  list: []
};

export default function (state = initialState, action: Action) {
  switch (action.type) {
    case DEVICE_CHANGE: {
      const { id, data } = action.payload;
      const list = clone(state.list);
      const index = list.findIndex((d) => d.id === id);
      if (index < 0) {
        list.push(data);
      }
      else if (!data) {
        list.splice(index, 1);
      }
      else {
        list[index] = data;
      }
      return {
        ...state,
        list
      };
    }
    case ADB_STATUS: {
      const status = action.payload.status as AdbState;
      if (status === 'error' || status === 'stopped') {
        return {
          ...state,
          list: []
        }
      }
      return state;
    }
    default:
      return state;
  }
}
