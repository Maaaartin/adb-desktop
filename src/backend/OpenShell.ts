import { AdbClientOptions } from 'adb-ts';
import { exec } from 'child_process';
import { app } from 'electron';
import Path from 'path';
import Preferences from './Preferences';

function formatCmd(cmd: string) {
  switch (process.platform) {
    case 'linux':
      return `./${cmd}`;

    default:
      return cmd;
  }
}

const scriptPath = Path.join('assets', process.platform, 'script.sh');

export default class OpenShell {
  static readonly script = app.isPackaged
    ? Path.join(process.resourcesPath, scriptPath)
    : Path.join(__dirname, '..', '..', scriptPath);
  static adbShell(id: string) {
    const options = Preferences.get('adb') as AdbClientOptions;
    const split = options.bin?.split(Path.sep) || [];
    const cmd = `${split[split.length - 1]} -s ${id} shell`;
    const cwd = Path.join(...split.splice(0, split.length - 1));
    return new Promise<void>((resolve, reject) => {
      exec(`${OpenShell.script} "${cwd}" "${formatCmd(cmd)}"`, (err) => {
        if (!err) return resolve();
        else return reject(err);
      });
    });
  }

  static adb() {
    const options = Preferences.get('adb') as AdbClientOptions;
    const split = options.bin?.split(Path.sep) || [];
    const cwd = Path.join(...split.splice(0, split.length - 1));
    return new Promise<void>((resolve, reject) => {
      exec(`${OpenShell.script} "${cwd}"`, (err) => {
        if (!err) return resolve();
        else return reject(err);
      });
    });
  }

  static emulator(serial: string) {
    const match = serial.match(/\d+/g);
    const port = match ? match[0] : 5554;
    const cwd = ' ';
    const cmd = `telnet localhost ${port}`;
    return new Promise<void>((resolve, reject) => {
      exec(`${OpenShell.script} "${cwd}" "${cmd}"`, (err) => {
        if (!err) return resolve();
        else return reject(err);
      });
    });
  }
}
