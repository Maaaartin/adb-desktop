import { clone } from 'lodash';
import { AdbClient, AdbClientOptions, IAdbDevice, Tracker } from 'adb-ts';
import Monkey from 'adb-ts/lib/monkey/client';
import { Dictionary } from 'lodash';
import Promise from 'bluebird';
import Preferences from './Preferences';
import { EventEmitter } from 'events';
import AdbDevice from 'adb-ts/lib/device';
import { FileSystemEntry } from '../frontend/types';

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

  getFiles(serial: string, path: string): Promise<FileSystemEntry[]> {
    return this.adb.readDir(serial, path).then((files) => {
      return Promise.map(files, (file) => {
        return this.adb
          .readDir(serial, `${path}/${file.name}`)
          .then((subFiles) => {
            return {
              name: file.name,
              type: file.isDirectory() || subFiles.length ? 'dir' : 'file',
              date: file.mtime,
              size: file.size,
            };
          });
      });
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
