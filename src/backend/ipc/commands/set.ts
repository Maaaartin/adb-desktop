import { typedIpcMain as ipc } from '../../../ipcIndex';
import { ipcExec } from '../../ipc';

export default function () {
  ipc.handle('putSettingGlobal', (_e, serial, key, value) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .putSetting(serial, 'global', key, value, (error) => {
          return { error };
        });
    });
  });

  ipc.handle('putSettingSecure', (_e, serial, key, value) => {
    return ipcExec((menu) => {
      return menu.adbHandler
        .getClient()
        .putSetting(serial, 'secure', key, value);
    });
  });

  ipc.handle('putSettingSystem', (_e, serial, key, value) => {
    return ipcExec((root) => {
      return root.adbHandler
        .getClient()
        .putSetting(serial, 'system', key, value, (error) => {
          return { error };
        });
    });
  });

  ipc.handle('setProp', (_e, serial, key, value) => {
    return ipcExec((menu) => {
      return menu.adbHandler.getClient().setProp(serial, key, value);
    });
  });
}
