import adbReducer, {
  AdbStateConstructor,
} from '../frontend/redux/reducers/adb';
import {
  addHistory,
  deviceAdd,
  loadToken,
  setAdbStatus,
} from '../frontend/redux/actions';
import consoleReducer, {
  ConsoleStateConstructor,
} from '../frontend/redux/reducers/console';
import deviceReducer, {
  DeviceStateConstructor,
} from '../frontend/redux/reducers/devices';
import emulatorReducer, {
  EmulatorStateConstructor,
} from '../frontend/redux/reducers/emulator';

import { IAdbDevice } from 'adb-ts';

describe('reducers', () => {
  it('devices reducer', () => {
    const device: IAdbDevice = {
      id: 'one',
      state: 'device',
      path: 'some',
      transport: 'usb',
    };
    expect(
      deviceReducer(DeviceStateConstructor(), deviceAdd(device))
        .get('list')
        .count()
    ).toEqual(1);
  });

  it('console reducer', () => {
    expect(
      consoleReducer(ConsoleStateConstructor(), addHistory('hello')).get(
        'history'
      )
    ).toContain('hello');
  });

  it('adb reducer', () => {
    expect(
      adbReducer(
        AdbStateConstructor(),
        setAdbStatus({ running: false, status: 'error', error: null })
      )
        .get('status')
        .get('running')
    ).toEqual(false);
  });

  it('emulator reducer', () => {
    expect(
      emulatorReducer(EmulatorStateConstructor(), loadToken('some_token')).get(
        'token'
      )
    ).toEqual('some_token');
  });
});
