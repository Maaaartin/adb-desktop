import { CommandResponse, typedIpcMain as ipc } from '../../../ipcIndex';

import { EmulatorClient } from 'emulator-ts';
import { getRoot } from '../../../main.dev';
import { noop } from 'lodash';

const handleExecResponse = (
  error: Error | null,
  value: string
): CommandResponse<string> => {
  const output = value?.trim() || '';
  if (error) {
    if (value) {
      return { output: error.message.concat(output) };
    } else {
      return { error, output };
    }
  } else {
    return { output };
  }
};
export default function () {
  ipc.handle('execDevice', (e, serial, cmd) => {
    return getRoot().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().execDevice(serial, cmd, (err, value) => {
          resolve(handleExecResponse(err, value));
        });
      });
    });
  });

  ipc.handle('execAdb', (e, cmd) => {
    return getRoot().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().exec(cmd, (err, value) => {
          resolve(handleExecResponse(err, value));
        });
      });
    });
  });

  ipc.handle('execMonkey', (e, serial, cmd) => {
    return getRoot().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getMonkey(serial, (error, monkey) => {
          if (error) {
            resolve({ error, output: '' });
          } else {
            monkey.send(cmd, (error, value) => {
              if (error) {
                resolve({ error, output: '' });
              } else {
                resolve({ error, output: value || '' });
              }
            });
          }
        });
      });
    });
  });

  ipc.handle('execEmulator', (e, serial, cmd) => {
    return getRoot().then((menu) => {
      return new Promise((resolve) => {
        menu.emulatorHandler.exec(serial, cmd, (err, value) => {
          resolve(handleExecResponse(err, value));
        });
      });
    });
  });
  ipc.handle('renewToken', () => {
    return EmulatorClient.readToken().then((output) => {
      return getRoot().then((root) => {
        root.emulatorHandler.setToken(output);
        return { output };
      });
    });
  });
}
