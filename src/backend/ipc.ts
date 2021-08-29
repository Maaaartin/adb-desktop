import { CommandResponse, Events } from '../ipcIndex';

import Root from './menu';
import { TypedWebContents } from 'electron-typed-ipc';
import _events from './ipc/events';
import _exec from './ipc/commands/exec';
import _fs from './ipc/commands/file-system';
import _get from './ipc/commands/get';
import _set from './ipc/commands/set';
import { callbackify } from 'util';
import { getRoot } from '../main.dev';
import { noop } from 'lodash';
import { webContents } from 'electron';

export const mainWebContent = (cb: (c: TypedWebContents<Events>) => void) => {
  getRoot().then((menu) => {
    cb(menu.mainWindow.webContents as TypedWebContents<Events>);
  }, noop);
};

export const allWebContents = (cb: (c: TypedWebContents<Events>) => void) => {
  webContents
    .getAllWebContents()
    .forEach((renderer: TypedWebContents<Events>) => {
      cb(renderer);
    });
};

let registered = false;

export const registerIpc = () => {
  if (!registered) {
    _exec();
    _events();
    _get();
    _set();
    _fs();
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
  caller: (root: Root) => Promise<T>,
  options?: { noDisplayErr?: boolean }
): Promise<CommandResponse<T>> => {
  const noErr = options?.noDisplayErr || false;
  return getRoot().then(
    (root) => {
      return new Promise((resolve) => {
        callbackify(() => caller(root))((error, output) => {
          if (error && !noErr) {
            mainWebContent((c) => {
              c.send('displayError', error);
            });
          }
          resolve({ error, output });
        });
      });
    },
    (error) => {
      if (error && !noErr) {
        mainWebContent((c) => {
          c.send('displayError', error);
        });
      }
      return { error };
    }
  );
};
