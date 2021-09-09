import { allWebContents, mainWebContent } from '../ipc';

import OpenShell from '../OpenShell';
import Preferences from '../Preferences';
import { getRoot } from '../../main.dev';
import { typedIpcMain as ipc } from '../../ipcIndex';
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
  ipc.on('writeAdbSettings', (_e, data) => {
    getRoot().then((root) => {
      root.adbHandler.saveAndStart(data);
    }, noop);
  });

  ipc.on('writeConsoleSettings', (_e, data) => {
    const curr = Preferences.get('console');
    Preferences.save('console', { ...curr, ...data }).catch(noop);
  });

  ipc.on('writeToken', (_e, token) => {
    getRoot().then((root) => {
      root.emulatorHandler.setToken(token).catch(noop);
    }, noop);
  });

  ipc.on('reset', () => {
    getRoot().then((root) => {
      allWebContents((c) => {
        c.send('loadAdbSettings', root.adbHandler.getAdbOptions());
      });
      allWebContents((c) => {
        c.send('loadConsoleSettings', root.getConsoleSettings());
      });
      allWebContents((c) => {
        c.send('adbStatus', root.adbHandler.getAdbStatus());
      });
    });
  });
}
