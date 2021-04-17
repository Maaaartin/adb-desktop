import { AdbClient, AdbClientOptions, IAdbDevice, Tracker } from 'adb-ts';
import AdbDevice from 'adb-ts/lib/device';
import Monkey from 'adb-ts/lib/monkey/client';
import Promise from 'bluebird';
import { exec } from 'child_process';
import { EventEmitter } from 'events';
import { clone, Dictionary } from 'lodash';
import {
  ExecFileSystemEntry,
  FileSystemEntry,
  SocketFileSystemEntry,
} from '../shared';
import Preferences from './Preferences';

export default class AdbHandler extends EventEmitter {
  private adb: AdbClient;
  private monkeys: Dictionary<Monkey> = {};
  private tracker?: Tracker;
  public running = false;
  constructor() {
    super();
    this.adb = new AdbClient(this.getAdbOptions());
  }

  private track() {
    this.adb.trackDevices((err, tracker) => {
      this.tracker = tracker;
      tracker.on('error', (err) => {
        this.running = false;
        this.emit('error', err);
        this.start();
      });
      tracker.on('add', (device) => {
        this.emit('add', device);
      });
      tracker.on('remove', (device) => {
        this.emit('remove', device);
      });
      tracker.on('change', (device) => {
        this.emit('change', device);
      });
    });
  }

  private startInternal() {
    this.emit('starting');
    return this.adb.startServer((err) => {
      if (err) this.emit('error', err);
      else {
        this.running = true;
        this.track();
        this.emit('start');
      }
    });
  }

  start(options?: AdbClientOptions) {
    options = clone(options);
    if (options) {
      Preferences.save('adb', options);
      this.adb = new AdbClient(options);
    }
    if (this.running) {
      this.stop(() => {
        this.startInternal();
      });
    } else {
      this.startInternal();
    }
  }

  stop(cb?: VoidFunction) {
    this.tracker?.end();
    this.adb.kill(() => {
      this.running = false;
      this.emit('stopped');
      cb?.();
    });
  }
  getClient() {
    return this.adb;
  }

  private isFileError(err: Error | null) {
    if (!err) return false;
    else return !/Permission denied/.test(err.message);
  }

  private parseNoAccessFiles(data: string) {
    const files = [];
    const regExp = /^ls: \/\/([\s\S]*?):/gm;
    let match;
    while ((match = regExp.exec(data))) {
      files.push(match[1]);
    }
    return files;
  }

  private parseFiles(data: string) {
    const files = [];
    const regExp = /^([\s\S]*?)\r\n/gm;
    let match;
    while ((match = regExp.exec(data))) {
      files.push(match[1]);
    }
    return files;
  }

  private getExecFiles(
    serial: string,
    path: string
  ): Promise<Dictionary<ExecFileSystemEntry>> {
    return new Promise((resolve, reject) => {
      const bin = this.getAdbOptions().bin || '';
      exec(`${bin} -s ${serial} shell ls ${path}`, (err, stdout, stderr) => {
        if (this.isFileError(err)) {
          reject(err);
        } else {
          const noAccessFiles = this.parseNoAccessFiles(stderr);
          const rootFiles = this.parseFiles(stdout);
          Promise.map(rootFiles, (file) => {
            return new Promise<{ name: string; type: string }>((resolve2) => {
              exec(
                `${bin} -s ${serial} shell ls ${path}/${file}`,
                (err2, subStdout) => {
                  if (err2) {
                    resolve2({ name: file, type: 'no-access' });
                  } else {
                    const subFiles = this.parseFiles(subStdout);
                    if (subFiles.length > 0) {
                      const subpath = subFiles[0].split('/');
                      if (subpath[subpath.length - 1].includes(file)) {
                        resolve2({ name: file, type: 'file' });
                      } else {
                        resolve2({ name: file, type: 'dir' });
                      }
                    } else {
                      resolve2({ name: file, type: 'no-access' });
                    }
                  }
                }
              );
            });
          }).then((res) => {
            const files: Dictionary<any> = {};
            noAccessFiles.forEach((item) => {
              files[item] = { type: 'no-access' };
            });
            res.forEach((item) => {
              files[item.name] = { type: item.type };
            });
            resolve(files);
          });
        }
      });
    });
  }

  private getSocketFiles(
    serial: string,
    path: string
  ): Promise<Dictionary<SocketFileSystemEntry>> {
    return this.adb.readDir(serial, path).then((data) => {
      const files: Dictionary<any> = {};
      data.forEach((item) => {
        files[item.name] = { date: item.mtime, size: item.size };
      });
      return files;
    });
  }

  getFiles(serial: string, path: string): Promise<FileSystemEntry> {
    return Promise.all([
      this.getExecFiles(serial, path),
      this.getSocketFiles(serial, path),
    ]).then(([execFiles, socketFiles]) => {
      const files: Dictionary<any> = {};
      Object.entries(execFiles).forEach(([key, data]) => {
        const socketFile = socketFiles[key] || {};
        files[key] = { ...data, ...socketFile };
      });
      return files;
    });
  }

  getAdbOptions(): AdbClientOptions {
    const options = Preferences.get('adb');
    options.port = options.port || 5037;
    return options;
  }

  getMonkey(serial: string, cb?: (err: Error, monkey: Monkey) => void) {
    const internal = (serial: string): Promise<Monkey> => {
      return new Promise<Monkey>((resolve, reject) => {
        if (this.monkeys[serial]) return resolve(this.monkeys[serial]);
        else {
          return this.adb.openMonkey(serial, (err, monkey) => {
            if (err) return reject(err);
            else {
              monkey.once('end', (err) => {
                return reject(err);
              });
              monkey.once('error', (err) => {
                return reject(err);
              });
              monkey.getAmCurrentAction((err) => {
                if (err) return reject(err);
                else {
                  this.monkeys[serial] = monkey;
                  monkey.on('end', () => {
                    delete this.monkeys[serial];
                  });
                  return resolve(monkey);
                }
              });
            }
          });
        }
      }).catch(() => {
        return internal(serial);
      });
    };
    return internal(serial).nodeify(cb);
  }

  on(event: 'remove', listener: (device: IAdbDevice) => void): this;
  on(event: 'change', listener: (device: AdbDevice) => void): this;
  on(event: 'add', listener: (device: AdbDevice) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'stopped', listener: () => void): this;
  on(event: 'starting', listener: () => void): this;
  on(event: 'start', listener: () => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void) {
    return super.on(event, listener);
  }
}
