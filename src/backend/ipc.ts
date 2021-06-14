import { CommandResponse, Events } from '../ipcIndex';

import Root from './menu';
import { TypedWebContents } from 'electron-typed-ipc';
import _exec from './ipc/commands/exec';
import _get from './ipc/commands/get';
import _open from './ipc/events';
import _set from './ipc/commands/set';
import { callbackify } from 'util';
import { getRoot } from '../main.dev';
import { noop } from 'lodash';

export const mainWebContent = (cb: (c: TypedWebContents<Events>) => void) => {
  getRoot().then((menu) => {
    cb(menu.mainWindow.webContents as TypedWebContents<Events>);
  }, noop);
};

let registered = false;

export const registerIpc = () => {
  if (!registered) {
    _exec();
    _open();
    _get();
    _set();
    process.on('uncaughtException', (error) => {
      mainWebContent((c) => {
        c.send('displayError', error);
      });
    });
    process.on('unhandledRejection', () => {
      mainWebContent((c) => {
        c.send('displayError', new Error('Unhandled Promise rejection'));
      });
    });
    registered = true;
  }
};

export const ipcExec = <T>(
  caller: (root: Root) => Promise<T>
): Promise<CommandResponse<T>> => {
  return getRoot().then((menu) => {
    return new Promise((resolve) => {
      callbackify(() => caller(menu))((error, output) => {
        if (error) {
          mainWebContent((c) => {
            c.send('displayError', error);
          });
        }
        resolve({ error, output });
      });
    });
  });
};
