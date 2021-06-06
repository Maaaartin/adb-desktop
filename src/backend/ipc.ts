import { Events } from '../ipcIndex';
import { TypedWebContents } from 'electron-typed-ipc';
import _exec from './ipc/commands/exec';
import _get from './ipc/commands/get';
import _open from './ipc/events/open';
import { getMenu } from '../main.dev';
import { noop } from 'lodash';

export const mainWebContent = (cb: (c: TypedWebContents<Events>) => void) => {
  getMenu().then((menu) => {
    cb(menu.mainWindow.webContents as TypedWebContents<Events>);
  }, noop);
};

let registered = false;

export const registerIpc = () => {
  if (!registered) {
    _exec();
    _open();
    _get();
    process.on('uncaughtException', (error) => {
      mainWebContent((c) => {
        c.send('displayError', error.message);
      });
    });
    registered = true;
  }
};
