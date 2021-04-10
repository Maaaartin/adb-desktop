import { Dictionary } from 'lodash';

export type ItemMaker<T> = {
  createKey?: (item: [string, T]) => string;
  createValue?: (item: [string, T]) => any;
  delimiter?: string;
  styleValue?: boolean;
  itemSetter?: (key: string, value: string, cb?: (err: Error) => void) => void;
  itemGetter?: (key: string, cb?: (err: Error, output: any) => void) => void;
};

export type CollectionFunctions<T> = {
  getter: (cb: (output: Dictionary<T>) => void) => void;
  onSearch: (item: [string, T], text: string) => boolean;
  valueToString: (item: [string, T]) => string;
};

export type ExecFileSystemData = {
  type: 'dir' | 'file' | 'no-access';
};

export type SocketFileSystemData = { date?: Date; size?: number };

export type FileSystemData = ExecFileSystemData & SocketFileSystemData;

export type ExecFileSystemEntry = Dictionary<ExecFileSystemData>;

export type SocketFileSystemEntry = Dictionary<SocketFileSystemData>;

export type FileSystemEntry = ExecFileSystemEntry & SocketFileSystemEntry;

export type TableSort = {
  type: 'asc' | 'desc';
  index: number;
};
