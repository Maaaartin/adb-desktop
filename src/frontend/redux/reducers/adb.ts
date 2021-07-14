import { AdbAction } from '../actionTypes';
import { AdbClientOptions } from 'adb-ts';
import { AdbRuntimeStatus } from '../../../shared';
import { Record } from 'immutable';

export type AdbStateProps = {
  status: Record<AdbRuntimeStatus>;
  settings: Record<AdbClientOptions>;
};

export type AdbRedState = Record<AdbStateProps> & Readonly<AdbStateProps>;

const StateConstructor = Record<AdbStateProps>({
  status: Record<AdbRuntimeStatus>({
    status: 'stopped',
    running: false,
    error: null,
  })(),
  settings: Record<AdbClientOptions>({})(),
});

export default function (
  state = StateConstructor(),
  action: AdbAction
): AdbRedState {
  switch (action.type) {
    case 'Status': {
      return state.update('status', (prev) =>
        prev.clear().merge(action.payload)
      );
    }
    case 'SettingsLoad':
    case 'SettingsWrite': {
      return state.update('settings', (prev) =>
        prev.clear().merge(action.payload)
      );
    }
  }
}
