import { getRoot } from '../../../main.dev';
import { typedIpcMain as ipc } from '../../../ipcIndex';
import { ipcExec } from '../../ipc';

export default function () {
  ipc.handle('putSettingGlobal', (e, serial, key, value) => {
    return getRoot().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler
          .getClient()
          .putSetting(serial, 'global', key, value, (error) => {
            resolve({ error });
          });
      });
    });
  });

  ipc.handle('putSettingSecure', (e, serial, key, value) => {
    return ipcExec((menu) => {
      return menu.adbHandler
        .getClient()
        .putSetting(serial, 'secure', key, value);
    });
  });

  ipc.handle('putSettingSystem', (e, serial, key, value) => {
    return getRoot().then((menu) => {
      return new Promise((resolve) => {
        menu.adbHandler
          .getClient()
          .putSetting(serial, 'system', key, value, (error) => {
            resolve({ error });
          });
      });
    });
  });

  ipc.handle('setProp', (e, serial, key, value) => {
    return ipcExec((menu) => {
      return menu.adbHandler.getClient().setProp(serial, key, value);
    });
  });
}
