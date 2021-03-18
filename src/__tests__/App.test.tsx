import { IAdbDevice } from 'adb-ts';
import { deviceAdd } from '../frontend/redux/actions';
import { DEVICE_ADD, DEVICE_CHANGE } from '../frontend/redux/actionTypes';

describe('App', () => {
  it('should render', () => {
    const device: IAdbDevice = {
      id: 'one',
      state: 'device',
      path: 'some',
      transport: 'usb',
    };
    expect(deviceAdd(device)).toEqual({ type: DEVICE_ADD, payload: device });
  });
});
