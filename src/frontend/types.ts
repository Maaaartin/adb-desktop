export type ItemMaker<T> = {
  createKey?: (item: [string, T]) => string;
  createValue?: (item: [string, T]) => any;
  delimiter?: string;
  styleValue?: boolean;
  itemSetter?: (key: string, value: string, cb?: (err: Error) => void) => void;
  itemGetter?: (key: string, cb?: (err: Error, output: any) => void) => void;
};
