import {
  ADB_STATUS,
  DEVICE_ADD,
  WRITE_CONSOLE_SETTINGS,
} from '../frontend/redux/actionTypes';
import {
  addHistory,
  deviceAdd,
  setAdbStatus,
  writeConsoleSettings,
} from '../frontend/redux/actions';

import { AdbStatus } from '../shared';
import { IAdbDevice } from 'adb-ts';

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

  it('history', () => {
    for (let i = 0; i < 50; i++) {
      addHistory(i.toString());
    }
    const settings = { lines: 30, historyLen: 20, history: [] };
    expect(writeConsoleSettings(settings)).toEqual({
      type: WRITE_CONSOLE_SETTINGS,
      payload: settings,
    });
  });
});

// describe('react', () => {
//   it('console', () => {
//     const component = rederer.create(
//       <Provider store={store}>
//         <Console serial="test" exec={Promise.resolve} openShell={() => null} />
//       </Provider>
//     );
//     const tree = component.toJSON();
//     expect(tree).toMatchSnapshot();
//   });
// });
