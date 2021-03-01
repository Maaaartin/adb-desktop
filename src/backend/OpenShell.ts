import { AdbClientOptions } from 'adb-ts';
import { exec } from 'child_process';
import fs from 'fs';
import Path from 'path';
import Preferences from './Preferences';

function makeBatch() {
  const dataDir = Path.join(process.env.LOCALAPPDATA || '', 'AndroidManager')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const script = Path.join(dataDir, 'script.sh');
  if (!fs.existsSync(script)) {
    fs.writeFileSync(script, 'cd $1\r\nexec start $2');
  }
}

makeBatch();
export default class OpenShell {
  static readonly script = Path.join(process.env.LOCALAPPDATA || '', 'AndroidManager', 'script.sh');
  static adbShell(id: string) {
    const options = Preferences.get('adb') as AdbClientOptions;
    const split = options.bin?.split(Path.sep) || [];
    const cmd = `${split[split.length - 1]} -s ${id} shell`;
    const cwd = Path.join(...split.splice(0, split.length - 1))
    return new Promise<void>((resolve, reject) => {
      exec(`${OpenShell.script} "${cwd}" "${cmd}"`,
        (err) => {
          if (!err) return resolve();
          else return reject(err);
        })
    });
  }

  static adb() {
    const options = Preferences.get('adb') as AdbClientOptions;
    const split = options.bin?.split(Path.sep) || [];
    const cwd = Path.join(...split.splice(0, split.length - 1))
    return new Promise<void>((resolve, reject) => {
      exec(`${OpenShell.script} "${cwd}"`,
        (err) => {
          if (!err) return resolve();
          else return reject(err);
        })
    });
  }

  static emulator(serial: string) {
    const match = serial.match(/\d+/g);
    const port = match ? match[0] : 5554;
    const cwd = ' ';
    const cmd = `telnet localhost ${port}`;
    return new Promise<void>((resolve, reject) => {
      exec(`${OpenShell.script} "${cwd}" "${cmd}"`,
        (err) => {
          if (!err) return resolve();
          else return reject(err);
        })
    });
  }
}
