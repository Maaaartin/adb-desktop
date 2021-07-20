import { DeviceAT, DeviceAction } from '../actionTypes';

import { IAdbDevice } from 'adb-ts';
import Notifications from 'react-notification-system-redux';
import store from '../store';

export const deviceAdd = (content: IAdbDevice): DeviceAction => {
  store.dispatch(Notifications.info({ title: `${content.id} plugged in` }));
  return {
    type: DeviceAT.Add,
    payload: content,
  };
};

export const deviceChange = (content: IAdbDevice): DeviceAction => ({
  type: DeviceAT.Change,
  payload: content,
});

export const deviceRemove = (content: IAdbDevice): DeviceAction => {
  store.dispatch(Notifications.info({ title: `${content.id} plugged out` }));
  return {
    type: DeviceAT.Remove,
    payload: content,
  };
};

export const deviceRemoveAll = (): DeviceAction => {
  return {
    type: DeviceAT.RemoveAll,
  };
};
