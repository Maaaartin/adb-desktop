import OpenShell from '../OpenShell';
import { getRoot } from '../../main.dev';
import { typedIpcMain as ipc } from '../../ipcIndex';
import { mainWebContent } from '../ipc';
import open from 'open';

export default function () {
  ipc.on('openAdbShell', (e, serial) => {
    OpenShell.adbShell(serial).catch((err) => {
      mainWebContent((content) => {
        content.send('displayError', err.message);
      });
    });
  });

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

  ipc.on('toggleAdb', () => {
    getRoot().then((root) => {
      const running = root.adbHandler.running;
      if (running) {
        root.adbHandler.stop();
      } else {
        root.adbHandler.start();
      }
    });
  });

  ipc.on('openLink', (e, link) => {
    open(link);
  });
}
