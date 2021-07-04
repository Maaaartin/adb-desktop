import { CP, DELETE_FILE, MKDIR, PULL_FILE } from '../../constants';

import { Dictionary } from 'lodash';
import { ipcRenderer as ipc } from 'electron';

const calls: Dictionary<
  ((error?: Error, data?: Dictionary<any>) => void) | undefined
> = {};
const hook = (cb?: (error?: Error, data?: Dictionary<any>) => void) => {
  const id = Math.random().toString(36).substring(7);
  calls[id] = cb;
  return id;
};

ipc.on(PULL_FILE, (event, data) => {
  handleResponse(data);
});

ipc.on(DELETE_FILE, (event, data) => {
  handleResponse(data);
});

ipc.on(MKDIR, (event, data) => {
  handleResponse(data);
});

ipc.on(CP, (event, data) => {
  handleResponse(data);
});

const handleResponse = (data: any) => {
  const { id, error } = data;
  delete data['error'];
  delete data['id'];
  calls[id]?.(error, data);
  delete calls[id];
};

// export const pullFile = (
//   serial: string,
//   srcPath: string,
//   cb?: (error?: Error, data?: Dictionary<any>) => void
// ) => {
//   const id = hook(cb);
//   ipc.send(PULL_FILE, { id, serial, srcPath });
// };

// export const deleteFile = (
//   serial: string,
//   path: string,
//   cb?: (error?: Error) => void
// ) => {
//   const id = hook(cb);
//   ipc.send(DELETE_FILE, { id, path, serial });
// };

// export const mkdir = (
//   serial: string,
//   path: string,
//   cb?: (error?: Error) => void
// ) => {
//   const id = hook(cb);
//   ipc.send(MKDIR, { id, path, serial });
// };

// export const cp = (
//   serial: string,
//   srcPath: string,
//   destPath: string,
//   cb?: (error?: Error) => void
// ) => {
//   const id = hook(cb);
//   ipc.send(CP, { id, srcPath, destPath, serial });
// };
