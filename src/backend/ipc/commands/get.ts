import { typedIpcMain as ipc } from '../../../ipcIndex';
import { ipcExec } from '../../ipc';

export default function () {
  ipc.handle('getBattery', (_e, serial) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .batteryStatus(serial, (error, output) => {
          return { output, error };
        });
    });
  });

  ipc.handle('getProps', (_e, serial) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .listProperties(serial, (error, output) => {
          return { output, error };
        });
    });
  });

  ipc.handle('getSettingsGlobal', (_e, serial) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .listSettings(serial, 'global', (error, output) => {
          return { output, error };
        });
    });
  });

  ipc.handle('getSettingsSecure', (_e, serial) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .listSettings(serial, 'secure', (error, output) => {
          return { output, error };
        });
    });
  });

  ipc.handle('getSettingsSystem', (_e, serial) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .listSettings(serial, 'system', (error, output) => {
          return { output, error };
        });
    });
  });

  ipc.handle('getFeatures', (_e, serial) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .listFeatures(serial, (error, output) => {
          return { output, error };
        });
    });
  });

  ipc.handle('getPackages', (_e, serial) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .listPackages(serial, (error, output) => {
          return { output, error };
        });
    });
  });

  ipc.handle('getFiles', (_e, serial, path) => {
    return ipcExec((root) => {
      return root.adbHandler.getFiles(serial, path);
    });
  });

  ipc.handle('getSettingGlobal', (_e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getSetting(serial, 'global', key);
    });
  });

  ipc.handle('getSettingSecure', (_e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getSetting(serial, 'secure', key);
    });
  });

  ipc.handle('getSettingSystem', (_e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getSetting(serial, 'system', key);
    });
  });

  ipc.handle('getProp', (_e, serial, key) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().getProp(serial, key);
    });
  });
}
