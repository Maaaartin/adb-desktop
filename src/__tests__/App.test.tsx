import { IAdbDevice } from 'adb-ts';
import React from 'react';
import { Provider } from 'react-redux';
import rederer from 'react-test-renderer';
import Console from '../frontend/components/Console';
import store from '../frontend/redux/store';
import { AdbStatus, deviceAdd, setAdbStatus } from '../frontend/redux/actions';
import {
  ADB_STATUS,
  DEVICE_ADD,
  DEVICE_CHANGE,
} from '../frontend/redux/actionTypes';

describe('redux', () => {
  it('device add', () => {
    const device: IAdbDevice = {
      id: 'one',
      state: 'device',
      path: 'some',
      transport: 'usb',
    };
    expect(deviceAdd(device)).toEqual({ type: DEVICE_ADD, payload: device });
  });

  it('adb status', () => {
    const status: AdbStatus = {
      status: 'error',
      running: false,
      error: null,
    };
    expect(setAdbStatus(status)).toEqual({ type: ADB_STATUS, payload: status });
  });
});

describe('react', () => {
  it('console', () => {
    const component = rederer.create(
      <Provider store={store}>
        <Console id="test" exec={(otp, cb) => {}} openShell={(id) => null} />
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
