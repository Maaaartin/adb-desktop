/**
 * @jest-environment jsdom
 */
import adbReducer, {
  AdbStateConstructor,
} from '../frontend/redux/reducers/adb';
import {
  addHistory,
  deviceAdd,
  loadToken,
  setAdbStatus,
  tabAdd,
  writeConsoleSettings,
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

import { AdbRuntimeStatus } from '../shared';
import Console from '../frontend/components/Console';
import { IAdbDevice } from 'adb-ts';
import { Provider } from 'react-redux';
import React from 'react';
import renderer from 'react-test-renderer';
import store from '../frontend/redux/store';

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

describe('action', () => {
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

describe('react', () => {
  it('console', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Console
          serial="test"
          exec={() => Promise.resolve({ output: '' })}
          openShell={() => null}
        />
      </Provider>,
      {
        createNodeMock: () => document.createElement('div'),
      }
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
