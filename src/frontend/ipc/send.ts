import { ipcRenderer as ipc } from 'electron';
import {
  OPEN_ADB,
  OPEN_ADB_SHELL,
  OPEN_EMULATOR,
  TOGGLE_ADB,
} from '../../constants';

export const openAdbShell = (id: string) => ipc.send(OPEN_ADB_SHELL, id);

export const openAdb = () => ipc.send(OPEN_ADB);

export const openEmulator = (id: string) => ipc.send(OPEN_EMULATOR, id);

export const toggleAdb = () => {
  ipc.send(TOGGLE_ADB);
};
