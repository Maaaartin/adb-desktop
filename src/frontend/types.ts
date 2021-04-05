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

export type FileSystemEntry = {
  name: string;
  type: 'dir' | 'file';
  size: number;
  date: Date;
};
