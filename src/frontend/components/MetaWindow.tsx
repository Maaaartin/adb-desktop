import { TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Dictionary, isEmpty as emp } from 'lodash';
import React, { ReactElement, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaSync } from 'react-icons/fa';
import IconBtn from './IconBtn';
import Scrollable from './Scrollable';
import SettableLi from './SettableLi';

type Props<T> = {
  getter: (cb: (output: Dictionary<T>) => void) => void;
  onSearch: (item: [string, T], text: string) => boolean;
  valueToString: (item: [string, T]) => string;
  tag: string;
  serial: string;
  itemMaker: {
    createKey?: (item: [string, T]) => string;
    createValue?: (item: [string, T]) => string;
    delimiter?: string;
    styleValue?: boolean;
    itemSetter?: (value: string, cb?: (err: Error) => void) => void;
    itemGetter?: (key: string, cb?: (err: Error, output: any) => void) => void;
  };
};

const MetaWindow: <T>(props: Props<T>) => ReactElement = (props) => {
  const {
    getter,
    onSearch,
    valueToString,
    tag,
    serial,
    itemMaker,
    itemMaker: { itemGetter, itemSetter },
  } = props;
  const [search, setSearch] = useState('');
  const [collection, setCollection] = useState<Dictionary<any>>({});
  if (emp(collection)) {
    getter((output) => {
      setCollection(output);
    });
  }
  const arr = Object.entries(collection).filter((item) => {
    if (!onSearch || !search) return true;
    else return onSearch(item, search);
  });
  return (
    <div className="h-full">
      <Row className="pr-4 mb-2">
        <Col xs={12} sm={5}>
          <Typography className="p-2">
            {tag} of {serial}
          </Typography>
        </Col>
        <Col xs={12} sm={7}>
          <Row end="xs">
            <Col>
              <IconBtn
                tag="Refresh"
                IconEl={FaSync}
                onClick={() => getter((output) => setCollection(output))}
              />
            </Col>
            <Col>
              <Autocomplete
                style={{ width: '300px' }}
                options={arr}
                getOptionLabel={(option) => valueToString(option)}
                onSelect={(e) => setSearch((e.target as any).value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    label="Search"
                    variant="standard"
                  />
                )}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Scrollable style={{ height: '90%' }}>
        <ul className="overflow-y-scroll border-black border-2 break-all h-full">
          {arr.map((item, index) => {
            return (
              <SettableLi
                index={index}
                item={item}
                itemMaker={itemMaker}
                onSetValue={(value) => {
                  itemSetter?.(value, (err) => {
                    if (err) {
                      // alert
                    } else
                      itemGetter?.(item[0], (err, output) => {
                        setCollection({ ...collection, [item[0]]: output });
                      });
                  });
                }}
              />
            );
          })}
        </ul>
      </Scrollable>
    </div>
  );
};

export default MetaWindow;
