import { Action } from '.';
import { LOAD_TOKEN, WRITE_TOKEN } from '../actionTypes';

type State = { token: string };

const initialState: State = {
  token: '',
};

export default function (state = initialState, action: Action<string>) {
  switch (action.type) {
    case LOAD_TOKEN:
    case WRITE_TOKEN: {
      return {
        ...state,
        token: action.payload,
      };
    }
    default:
      return state;
  }
}
