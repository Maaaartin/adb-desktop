import { Action } from ".";
import { AdbStatus } from "../actions";
import { ADB_STATUS } from "../actionTypes";

const initialState: { status: AdbStatus } = {
  status: {
    running: false,
    status: '' as any,
    error: null
  }
};

// TODO clear devices on adb stop
export default function (state = initialState, action: Action<AdbStatus>) {
  switch (action.type) {
    case ADB_STATUS: {
      return {
        ...state,
        status: action.payload
      };
    }
    default:
      return state;
  }
}
