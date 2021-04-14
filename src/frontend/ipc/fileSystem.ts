import { ipcRenderer as ipc } from 'electron';
import { Dictionary } from 'lodash';
import { PULL_FILE, DELETE_FILE } from '../../constants';

const calls: Dictionary<((error: Error) => void) | undefined> = {};
const hook = (cb?: (error: Error) => void) => {
  const id = Math.random().toString(36).substring(7);
  calls[id] = cb;
  return id;
};

ipc.on(PULL_FILE, (event, data) => {
  handleResponse(data);
});

const handleResponse = (data: any) => {
  const { id, error } = data;

  calls[id]?.(error);
  delete calls[id];
};

export const pullFile = (
  serial: string,
  srcPath: string,
  cb?: (error?: Error, data?: Dictionary<any>) => void
) => {
  const id = hook(cb);
  ipc.send(PULL_FILE, { id, serial, srcPath });
};
