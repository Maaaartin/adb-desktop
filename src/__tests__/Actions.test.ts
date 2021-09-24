import {
  addHistory,
  deviceAdd,
  setAdbStatus,
  tabAdd,
  writeConsoleSettings,
} from '../frontend/redux/actions';

import { AdbRuntimeStatus } from '../shared';
import { IAdbDevice } from 'adb-ts';

describe('actions', () => {
  it('device add', () => {
    const device: IAdbDevice = {
      id: 'one',
      state: 'device',
      path: 'some',
      transport: 'usb',
    };
    expect(deviceAdd(device)).toEqual({ type: 'DeviceAdd', payload: device });
  });

  it('adb status', () => {
    const status: AdbRuntimeStatus = {
      status: 'error',
      running: false,
      error: null,
    };
    expect(setAdbStatus(status)).toEqual({
      type: 'AdbStatus',
      payload: status,
    });
  });

  it('history', () => {
    for (let i = 0; i < 50; i++) {
      addHistory(i.toString());
    }
    const settings = { lines: 30, historyLen: 20, history: [] };
    expect(writeConsoleSettings(settings)).toEqual({
      type: 'ConsoleWriteSettings',
      payload: settings,
    });
  });

  it('tabs', () => {
    expect(tabAdd('Test', () => null).payload.name).toEqual('Test');
  });
});
