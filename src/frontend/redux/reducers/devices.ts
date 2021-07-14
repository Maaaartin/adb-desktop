import { Map, Record } from 'immutable';

import { DeviceAction } from '../actionTypes';
import { IAdbDevice } from 'adb-ts';

export type DevicesStateProps = {
  list: Map<string, IAdbDevice>;
};

export type DevicesState = Record<DevicesStateProps> &
  Readonly<DevicesStateProps>;

const StateConstructor = Record<DevicesStateProps>({
  list: Map<string, IAdbDevice>(),
});

export default function (
  state = StateConstructor(),
  action: DeviceAction
): DevicesState {
  switch (action.type) {
    case 'Add':
    case 'Change': {
      return state.update('list', (list) =>
        list.update(action.payload.id, () => action.payload)
      );
    }
    case 'Remove': {
      return state.update('list', (list) => list.delete(action.payload.id));
    }
    case 'RemoveAll':
      return state.update('list', (list) => list.clear());
  }
}
