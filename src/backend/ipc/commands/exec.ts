import { CommandResponse, typedIpcMain as ipc } from '../../../ipcIndex';

import { EmulatorClient } from 'emulator-ts';
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
    return ipcExec(
      (root) => {
        return root.adbHandler
          .getClient()
          .execDevice(serial, cmd, (err, value) => {
            return handleExecResponse(err, value);
          });
      },
      { noDisplayErr: true }
    );
  });

  ipc.handle('execAdb', (_e, cmd) => {
    return ipcExec(
      (root) => {
        return root.adbHandler.getClient().exec(cmd, (err, value) => {
          return handleExecResponse(err, value);
        });
      },
      { noDisplayErr: true }
    );
  });

  ipc.handle('execMonkey', (_e, serial, cmd) => {
    return ipcExec(
      (root) => {
        return new Promise((resolve, reject) => {
          root.adbHandler.getMonkey(serial, (error, monkey) => {
            if (error) {
              reject(error);
            } else {
              monkey.send(cmd, (error, value) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(value || '');
                }
              });
            }
          });
        });
      },
      { noDisplayErr: true }
    );
  });

  ipc.handle('execEmulator', (_e, serial, cmd) => {
    return ipcExec(
      (root) => {
        return root.emulatorHandler.exec(serial, cmd, (err, value) => {
          return handleExecResponse(err, value);
        });
      },
      { noDisplayErr: true }
    );
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
