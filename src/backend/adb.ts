import { AdbClient, AdbClientOptions, IAdbDevice, Tracker } from 'adb-ts';
import { AdbRuntimeStatus, FileSystemData } from '../shared';
import { Dictionary, clone, noop } from 'lodash';

import AdbDevice from 'adb-ts/lib/device';
import { EventEmitter } from 'events';
import { IFileStats } from 'adb-ts/lib/filestats';
import Monkey from 'adb-ts/lib/monkey/client';
import Preferences from './Preferences';
import Promise from 'bluebird';

export default class AdbHandler extends EventEmitter {
  private adb: AdbClient;
  private monkeys: Dictionary<Monkey> = {};
  private tracker?: Tracker;
  private status: Readonly<AdbRuntimeStatus> = {
    status: 'stopped',
    running: false,
    error: null,
  };
  public running = false;
  constructor() {
    super();
    this.adb = new AdbClient(this.getAdbOptions());
  }

  private track() {
    this.adb.trackDevices((_err, tracker) => {
      this.tracker = tracker;
      tracker.on('error', (err) => {
        this.running = false;
        this.emit('error', err);
        this.saveAndStart();
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
    this.status = {
      error: null,
      running: true,
      status: 'starting',
    };
    this.emit('starting');
    return this.adb.startServer((err) => {
      if (err) {
        this.status = {
          error: err,
          running: false,
          status: 'error',
        };
        this.emit('error', err);
      } else {
        this.status = {
          error: null,
          running: true,
          status: 'running',
        };
        this.running = true;
        this.track();
        this.emit('start');
      }
    });
  }

  getAdbStatus() {
    return { ...this.status };
  }

  saveAndStart(options?: AdbClientOptions) {
    options = clone(options);
    if (options) {
      this.adb = new AdbClient(options);
      Preferences.save('adb', options).catch(noop);
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
      this.status = {
        error: null,
        running: false,
        status: 'stopped',
      };
      this.running = false;
      this.emit('stopped');
      cb?.();
    });
  }
  getClient() {
    return this.adb;
  }

  getFiles(serial: string, path: string): Promise<FileSystemData> {
    const buildRes = (stats: IFileStats) => {
      const split = stats.name.split('/');
      stats.name = split[split.length - 1];
      return {
        name: stats.name,
        stats,
        access: true,
        fullPath: path.concat('/', stats.name),
      };
    };
    return Promise.all([
      this.adb.fileStat(serial, path),
      this.adb.readDir(serial, path),
    ]).then(([stats, files]) => {
      return Promise.map(files, (item) => {
        return this.adb
          .fileStat(serial, `${path.replace(/\/$/, '')}/${item.name}`)
          .then((data) => {
            // is symbolic link
            if (data.lname.includes('->')) {
              const linkPath = data.lname.split('->')[1].replace(/\s|'|`/g, '');
              return this.adb.readDir(serial, linkPath).then((entries) => {
                if (entries.length) {
                  data.type = 'directory';
                }
                return buildRes(data);
              });
            } else {
              return buildRes(data);
            }
          })
          .catch(() => {
            return {
              name: item.name,
              access: false,
              fullPath: path.concat('/', item.name),
            };
          });
      }).then((children) => {
        return {
          name: stats.name,
          stats,
          access: true,
          children,
          fullPath: path.concat('/', stats.name),
        };
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
        if (this.monkeys[serial]) {
          return resolve(this.monkeys[serial]);
        } else {
          return this.adb.openMonkey(serial, (err, monkey) => {
            if (err) {
              return reject(err);
            } else {
              monkey.once('end', (err) => {
                return reject(err);
              });
              monkey.once('error', (err) => {
                return reject(err);
              });
              // checking if monkey is correct
              monkey.getAmCurrentAction((err) => {
                if (err) {
                  return reject(err);
                } else {
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
