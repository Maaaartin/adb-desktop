import { CommandResponse, typedIpcMain as ipc } from '../../../ipcIndex';

import { getMenu } from '../../../main.dev';

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
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().execDevice(serial, cmd, (err, value) => {
          resolve(handleExecResponse(err, value));
        });
      });
    });
  });

  ipc.handle('execAdb', (e, cmd) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().exec(cmd, (err, value) => {
          resolve(handleExecResponse(err, value));
        });
      });
    });
  });

  ipc.handle('execMonkey', (e, serial, cmd) => {
    return getMenu().then((menu) => {
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
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.emulatorHandler.exec(serial, cmd, (err, value) => {
          resolve(handleExecResponse(err, value));
        });
      });
    });
  });
}
