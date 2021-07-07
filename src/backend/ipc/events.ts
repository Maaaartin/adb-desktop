import OpenShell from '../OpenShell';
import Preferences from '../Preferences';
import { getRoot } from '../../main.dev';
import { typedIpcMain as ipc } from '../../ipcIndex';
import { mainWebContent } from '../ipc';
import { noop } from 'lodash';
import open from 'open';

export default function () {
  ipc.on('openAdbShell', (_e, serial) => {
    OpenShell.adbShell(serial).catch((err) => {
      mainWebContent((content) => {
        content.send('displayError', err.message);
      });
    });
  });

  ipc.on('openAdb', (_e) => {
    OpenShell.adb().catch((err) => {
      mainWebContent((content) => {
        content.send('displayError', err.message);
      });
    });
  });

  ipc.on('openEmulator', (_e, serial) => {
    OpenShell.emulator(serial).catch((err) => {
      mainWebContent((content) => {
        content.send('displayError', err.message);
      });
    });
  });

  ipc.on('toggleAdb', () => {
    getRoot().then((root) => {
      const running = root.adbHandler.running;
      if (running) {
        root.adbHandler.stop();
      } else {
        root.adbHandler.saveAndStart();
      }
    }, noop);
  });

  ipc.on('openLink', (_e, link) => {
    open(link).catch(noop);
  });
  // TODO display error?
  ipc.on('writeAdbSettings', (_e, data) => {
    getRoot().then((root) => {
      root.adbHandler.saveAndStart(data);
    }, noop);
  });

  ipc.on('writeConsoleSettings', (_e, data) => {
    // TODO might delete history
    Preferences.save('console', data).catch(noop);
  });

  ipc.on('writeToken', (_e, token) => {
    getRoot().then((root) => {
      root.emulatorHandler.setToken(token).catch(noop);
    }, noop);
  });
}
