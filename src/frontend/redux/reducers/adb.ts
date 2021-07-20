import { AdbAction } from '../actionTypes';
import { AdbClientOptions } from 'adb-ts';
import { AdbRuntimeStatus } from '../../../shared';
import { Record } from 'immutable';

export type AdbStateProps = {
  status: Record<AdbRuntimeStatus>;
  settings: Record<AdbClientOptions>;
};

export type AdbRedState = Record<AdbStateProps> & Readonly<AdbStateProps>;

export const AdbStateConstructor = Record<AdbStateProps>({
  status: Record<AdbRuntimeStatus>({
    status: 'stopped',
    running: false,
    error: null,
  })(),
  settings: Record<AdbClientOptions>({})(),
});

export default function (
  state = AdbStateConstructor(),
  action: AdbAction
): AdbRedState {
  switch (action.type) {
    case 'AdbStatus': {
      return state.update('status', (prev) =>
        prev.clear().merge(action.payload)
      );
    }
    case 'AdbSettingsLoad':
    case 'AdbSettingsWrite': {
      return state.update('settings', (prev) =>
        prev.clear().merge(action.payload)
      );
    }
    default:
      return state;
  }
}
