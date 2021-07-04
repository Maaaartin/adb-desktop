import { CommandResponse, typedIpcMain as ipc } from '../../../ipcIndex';

import { EmulatorClient } from 'emulator-ts';
import { getRoot } from '../../../main.dev';
import { ipcExec } from '../../ipc';

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
  ipc.handle('execDevice', (_e, serial, cmd) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .execDevice(serial, cmd, (err, value) => {
          return handleExecResponse(err, value);
        });
    });
  });

  ipc.handle('execAdb', (_e, cmd) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().exec(cmd, (err, value) => {
        return handleExecResponse(err, value);
      });
    });
  });

  ipc.handle('execMonkey', (_e, serial, cmd) => {
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

  ipc.handle('execEmulator', (_e, serial, cmd) => {
    return ipcExec((root) => {
      return root.emulatorHandler.exec(serial, cmd, (err, value) => {
        return handleExecResponse(err, value);
      });
    });
  });

  ipc.handle('renewToken', () => {
    return ipcExec((root) => {
      return EmulatorClient.readToken().then((output) => {
        root.emulatorHandler.setToken(output);
        return output;
      });
    });
  });
}
