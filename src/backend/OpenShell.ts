import { AdbClientOptions } from 'adb-ts';
import { exec } from 'child_process';
import fs from 'fs';
import Path from 'path';
import Preferences from './Preferences';

function makeScript() {
  const dataDir = Path.join(process.env.LOCALAPPDATA || '', 'AdbDesktop');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const script = Path.join(dataDir, 'script.sh');
  if (!fs.existsSync(script)) {
    switch (process.platform) {
      case 'linux':
        fs.writeFileSync(script, 'cd $1\r\ngnome-terminal -- $2');
        break;
      default:
        fs.writeFileSync(script, 'cd $1\r\nexec start $2');
        break;
    }
  }
}

function formatCmd(cmd: string) {
  switch (process.platform) {
    case 'linux':
      return `./${cmd}`;

    default:
      return cmd;
  }
}

makeScript();
export default class OpenShell {
  static readonly script = Path.join(
    process.env.LOCALAPPDATA || '',
    'AdbDesktop',
    'script.sh'
  );
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
