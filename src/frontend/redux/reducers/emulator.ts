import { EmulatorAction } from '../actionTypes';
import { Record } from 'immutable';

export type EmulatorStateProps = {
  token: string;
};

export type EmulatorState = Record<EmulatorStateProps> &
  Readonly<EmulatorStateProps>;

const StateConstructor = Record<EmulatorStateProps>({
  token: '',
});

export default function (
  state = StateConstructor(),
  action: EmulatorAction
): EmulatorState {
  switch (action.type) {
    case 'TokenLoad':
    case 'TokenWrite': {
      return state.update('token', () => action.payload);
    }
    default:
      return state;
  }
}
