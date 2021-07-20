import { ipcRenderer as ipc } from 'electron';
import {
  OPEN_ADB,
  OPEN_ADB_SHELL,
  OPEN_EMULATOR,
  OPEN_LINK,
  RENEW_TOKEN,
  TOGGLE_ADB,
} from '../../constants';

export const openAdbShell = (id: string) => ipc.send(OPEN_ADB_SHELL, id);

export const openAdb = () => ipc.send(OPEN_ADB);

export const openEmulator = (id: string) => ipc.send(OPEN_EMULATOR, id);

export const toggleAdb = () => ipc.send(TOGGLE_ADB);

export const renewToken = () => ipc.send(RENEW_TOKEN);

export const openLink = (link: string) => ipc.send(OPEN_LINK, link);
