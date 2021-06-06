import OpenShell from '../../OpenShell';
import { typedIpcMain as ipc } from '../../../ipcIndex';
import { mainWebContent } from '../../ipc';

export default function () {
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
}
