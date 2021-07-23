import { Dictionary } from 'lodash';
import { IFileStats } from 'adb-ts/lib/filestats';

export const isDev =
  process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production';

export const isTest =
  process.env.NODE_ENV !== 'development' &&
  process.env.NODE_ENV !== 'production';

export type AdbState = 'starting' | 'running' | 'stopped' | 'error';

export type AdbRuntimeStatus = {
  status: AdbState;
  running: boolean;
  error: Error | null;
};

export type ConsoleSettingsUpdate = {
  lines?: number;
  history?: string[];
  historyLen?: number;
};

export type ConsoleSettings = {
  lines: number;
  history: string[];
  historyLen: number;
};

export type ItemMaker<T> = {
  createKey?: (item: [string, T]) => string;
  createValue?: (item: [string, T]) => any;
  delimiter?: string;
  styleValue?: boolean;
  itemSetter?: (
    key: string,
    value: string,
    cb?: (err?: Error | null) => void
  ) => void;
  itemGetter?: (key: string, cb?: (output: any) => void) => void;
};

export type CollectionFunctions<T> = {
  getter: (cb: (output: Dictionary<T>) => void) => void;
  onSearch: (item: [string, T], text: string) => boolean;
  valueToString: (item: [string, T]) => string;
};

export type FileSystemAccess = 'dir' | 'file' | 'no-access';

export type ExecFileSystemData = {
  type: FileSystemAccess;
};

export type SocketFileSystemData = { date?: Date; size?: number };

export type FileSystemData = {
  name: string;
  access: boolean;
  fullPath: string;
  stats?: IFileStats;
  children?: FileSystemData[];
};

export type ExecFileSystemEntry = Dictionary<ExecFileSystemData>;

export type SocketFileSystemEntry = Dictionary<SocketFileSystemData>;

export type FileSystemEntry = Dictionary<FileSystemData>;

export type TableSort = {
  type: 'asc' | 'desc';
  index: number;
};

export class AdbFilePath {
  private paths: string[] = [];
  constructor(value?: string | string[]) {
    if (typeof value === 'string') {
      this.paths = value.split('/').filter((v) => !!v);
    } else if (Array.isArray(value)) {
      this.paths = value;
    }
  }

  static parse(value: string) {
    return new AdbFilePath(value);
  }

  static isChildOf(parentPath: string, childPath: string) {
    const parentArr = parentPath.split('/');
    const parentDir = parentArr[parentArr.length - 1];
    const childArr = childPath.split('/');
    const res = childArr[parentArr.length - 1] === parentDir;
    return res;
  }

  getPathArray() {
    return [...this.paths];
  }

  getParent() {
    return new AdbFilePath(this.getPathArray().slice(0, this.paths.length - 1));
  }

  getParentString() {
    return '/'.concat(this.paths.slice(0, this.paths.length - 1).join('/'));
  }

  toString() {
    return '/'.concat(this.paths.join('/'));
  }

  getLast() {
    return this.paths[this.paths.length - 1];
  }

  append(value: string) {
    this.paths.push(value);
    return this;
  }

  clone() {
    return new AdbFilePath(this.toString());
  }
}
