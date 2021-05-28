import { CommandResponse, Events, typedIpcMain as ipc } from '../rpc';

import OpenShell from './OpenShell';
import { TypedWebContents } from 'electron-typed-ipc';
import { getMenu } from '../main.dev';

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

const mainWebContent = (cb: (c: TypedWebContents<Events>) => void) => {
  getMenu()
    .then((menu) => {
      cb(menu.mainWindow.webContents as TypedWebContents<Events>);
    })
    .catch(() => {});
};

const registerEvents = () => {
  ipc.on('openAdbShell', (e, serial) => {
    OpenShell.adbShell(serial).catch((err) => {
      mainWebContent((content) => {
        content.send('displayError', err.message);
      });
    });
  });

  // TODO check err msg content
  ipc.on('openAdb', (e) => {
    OpenShell.adb().catch((err) => {
      mainWebContent((content) => {
        content.send('displayError', err.message);
      });
    });
  });

  ipc.on('openEmulator', (e, serial) => {
    OpenShell.emulator(serial).catch((err) => {
      mainWebContent((content) => {
        content.send('displayError', err.message);
      });
    });
  });
};

const registerCommands = () => {
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
};

export const registerIpc = () => {
  registerCommands();
  registerEvents();
  process.on('uncaughtException', (error) => {
    mainWebContent((c) => {
      c.send('displayError', error.message);
    });
  });
};
