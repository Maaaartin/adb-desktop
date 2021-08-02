import { ipcExec, mainWebContent } from '../../ipc';

import Path from 'path';
import { dialog } from 'electron';
import { typedIpcMain as ipc } from '../../../ipcIndex';

const execHandler = ({
  error,
  output,
}: {
  error?: Error | null;
  output?: any;
}) => {
  if (error) {
    return { error, output: undefined };
  } else if (output) {
    mainWebContent((c) => {
      c.send('displayError', error);
    });
    return { error: new Error(`${output}`) };
  } else {
    return {};
  }
};

export default function () {
  ipc.handle('cp', (_e, serial, srcPath, destPath) => {
    return ipcExec(
      (root) => {
        return root.adbHandler.getClient().cp(serial, srcPath, destPath);
      },
      { noDisplayErr: true }
    ).then(execHandler);
  });

  ipc.handle('mkdir', (_e, serial, path) => {
    return ipcExec(
      (root) => {
        return root.adbHandler.getClient().mkdir(serial, path);
      },
      { noDisplayErr: true }
    ).then(execHandler);
  });

  ipc.handle('rm', (_e, serial, path) => {
    return ipcExec(
      (root) => {
        return root.adbHandler.getClient().shell(serial, `rm -r ${path}`);
      },
      { noDisplayErr: true }
    ).then(execHandler);
  });

  ipc.handle('pull', (_e, serial, srcPath) => {
    return ipcExec(
      (root) => {
        return dialog
          .showOpenDialog(root.mainWindow, { properties: ['openDirectory'] })
          .then((value) => {
            const splitPath = srcPath.split('/');
            const filePath = splitPath[splitPath.length - 1];
            const destPath = Path.join(value.filePaths[0], filePath);
            return root.adbHandler
              .getClient()
              .pullFile(serial, srcPath, destPath);
          });
      },
      { noDisplayErr: true }
    );
  });

  ipc.handle('touch', (_e, serial, path) => {
    return ipcExec((root) => {
      return root.adbHandler.getClient().touch(serial, path);
    }).then(execHandler);
  });
}
