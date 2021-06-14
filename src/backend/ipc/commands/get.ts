import { getRoot } from '../../../main.dev';
import { typedIpcMain as ipc } from '../../../ipcIndex';
import { ipcExec } from '../../ipc';

export default function () {
  ipc.handle('getBattery', (e, serial) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler.getClient().batteryStatus(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getProps', (e, serial) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler.getClient().listProperties(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getSettingsGlobal', (e, serial) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler
          .getClient()
          .listSettings(serial, 'global', (error, output) => {
            resolve({ output, error });
          });
      });
    });
  });

  ipc.handle('getSettingsSecure', (e, serial) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler
          .getClient()
          .listSettings(serial, 'secure', (error, output) => {
            resolve({ output, error });
          });
      });
    });
  });

  ipc.handle('getSettingsSystem', (e, serial) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler
          .getClient()
          .listSettings(serial, 'system', (error, output) => {
            resolve({ output, error });
          });
      });
    });
  });

  ipc.handle('getFeatures', (e, serial) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler.getClient().listFeatures(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getPackages', (e, serial) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler.getClient().listPackages(serial, (error, output) => {
          resolve({ output, error });
        });
      });
    });
  });

  ipc.handle('getFiles', (e, serial, path) => {
    return getRoot().then((root) => {
      return new Promise((resolve) => {
        root.adbHandler
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

  ipc.handle('getSettingGlobal', (e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getSetting(serial, 'global', key);
    });
  });

  ipc.handle('getSettingSecure', (e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getSetting(serial, 'secure', key);
    });
  });

  ipc.handle('getSettingSecure', (e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getSetting(serial, 'secure', key);
    });
  });

  ipc.handle('getSettingSystem', (e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getSetting(serial, 'system', key);
    });
  });

  ipc.handle('getProp', (e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getProp(serial, key);
    });
  });
}
