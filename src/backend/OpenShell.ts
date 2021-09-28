import { AdbClientOptions } from 'adb-ts';
import { execute } from './execute';
import Path from 'path';
import Preferences from './Preferences';

export default class OpenShell {
  static adbShell(id: string) {
    const options = Preferences.get('adb') as AdbClientOptions;
    const split = options.bin?.split(Path.sep) || [];
    const cmd = `${split[split.length - 1]} -s ${id} shell`;
    const cwd = Path.join(...split.splice(0, split.length - 1));
    // return new Executor({ cmd, cwd }).execute();
    return execute({ cwd, cmd, prefixCmd: true });
  }

  static adb() {
    const options = Preferences.get('adb') as AdbClientOptions;
    const split = options.bin?.split(Path.sep) || [];
    const cwd = Path.join(...split.splice(0, split.length - 1));
    // return new Executor({ cwd }).execute();
    return execute({ cwd });
  }

  static emulator(serial: string) {
    const match = serial.match(/\d+/g);
    const port = match ? match[0] : 5554;
    const cmd = `telnet localhost ${port}`;
    // return new Executor({ cmd }).execute();
    return execute({ cmd });
  }
}
