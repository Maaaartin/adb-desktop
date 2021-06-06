import { getMenu } from '../../../main.dev';
import { typedIpcMain as ipc } from '../../../ipcIndex';

export default function () {
  ipc.handle('getBattery', (e, serial) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().batteryStatus(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getProps', (e, serial) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().listProperties(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getSettingsGlobal', (e, serial) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler
          .getClient()
          .listSettings(serial, 'global', (error, output) => {
            resolve({ output, error });
          });
      });
    });
  });

  ipc.handle('getSettingsSecure', (e, serial) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler
          .getClient()
          .listSettings(serial, 'secure', (error, output) => {
            resolve({ output, error });
          });
      });
    });
  });

  ipc.handle('getSettingsSystem', (e, serial) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler
          .getClient()
          .listSettings(serial, 'system', (error, output) => {
            resolve({ output, error });
          });
      });
    });
  });

  ipc.handle('getFeatures', (e, serial) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().listFeatures(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getPackages', (e, serial) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler.getClient().listPackages(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getFiles', (e, serial, path) => {
    return getMenu().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler
          .getFiles(serial, path)
          .then((output) => {
            resolve({ output });
          })
          .catch((error) => {
            resolve({ error });
          });
      });
    });
  });
}
