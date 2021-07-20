import { Map, Record } from 'immutable';

import { DeviceAction } from '../actionTypes';
import { IAdbDevice } from 'adb-ts';

export type DevicesStateProps = {
  list: Map<string, IAdbDevice>;
};

export type DevicesState = Record<DevicesStateProps> &
  Readonly<DevicesStateProps>;

export const DeviceStateConstructor = Record<DevicesStateProps>({
  list: Map<string, IAdbDevice>(),
});

export default function (
  state = DeviceStateConstructor(),
  action: DeviceAction
): DevicesState {
  switch (action.type) {
    case 'DeviceAdd':
    case 'DeviceChange': {
      return state.update('list', (list) =>
        list.update(action.payload.id, () => action.payload)
      );
    }
    case 'DeviceRemove': {
      return state.update('list', (list) => list.delete(action.payload.id));
    }
    case 'DeviceRemoveAll':
      return state.update('list', (list) => list.clear());
    default:
      return state;
  }
}
