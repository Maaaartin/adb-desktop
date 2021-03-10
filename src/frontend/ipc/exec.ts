import { ipcRenderer as ipc } from 'electron';
import { Dictionary } from 'lodash';
import {
  EXEC_ADB,
  EXEC_DEVICE,
  EXEC_EMULATOR,
  EXEC_MONKEY,
} from '../../constants';

const execCalls: Dictionary<
  ((error: Error, output: string) => void) | undefined
> = {};

const hookExec = (cb?: (error: Error, output: string) => void) => {
  const id = Math.random().toString(36).substring(7);
  execCalls[id] = cb;
  return id;
};

const handleExecResponse = (data: any) => {
  const { output, id, error } = data;
  execCalls[id]?.(error, output);
  delete execCalls[id];
};

ipc.on(EXEC_DEVICE, (event, data) => {
  handleExecResponse(data);
});

ipc.on(EXEC_ADB, (event, data) => {
  handleExecResponse(data);
});

ipc.on(EXEC_MONKEY, (event, data) => {
  handleExecResponse(data);
});

ipc.on(EXEC_EMULATOR, (event, data) => {
  handleExecResponse(data);
});

export const execAdbDevice = (
  serial: string,
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_DEVICE, { cmd, serial, id });
};

export const execEmulator = (
  serial: string,
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_EMULATOR, { cmd, id, serial });
};

export const execMonkey = (
  serial: string,
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_MONKEY, { cmd, id, serial });
};

export const execAdb = (
  cmd: string,
  cb?: (error: Error, output: string) => void
) => {
  const id = hookExec(cb);
  ipc.send(EXEC_ADB, { cmd, id });
};
