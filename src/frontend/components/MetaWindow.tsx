import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Dictionary, isEmpty as emp } from 'lodash';
import React, { ReactElement, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaSync } from 'react-icons/fa';
import IconBtn from './IconBtn';
import Scrollable from './Scrollable';

type Props<T> = {
  getter: (cb: (output: Dictionary<T>) => void) => void;
  createItem: (item: [string, T]) => any;
  onSearch: (item: [string, T], text: string) => boolean;
  valueToString: (item: [string, T]) => string;
};

const MetaWindow: <T>(props: Props<T>) => ReactElement = (props) => {
  const { getter, createItem, onSearch, valueToString } = props;
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
    <>
      <Row end="xs" className="pr-4 mb-2">
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
      <Scrollable>
        <ul
          className="overflow-y-scroll border-black border-2 break-all"
          style={{ height: 'calc(86vh - 100px)' }}
        >
          {arr.map((item, index) => {
            return (
              <li
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? '#8f97a1' : '#9a9fa6',
                }}
              >
                {createItem(item)}
              </li>
            );
          })}
        </ul>
      </Scrollable>
    </>
  );
};

export default MetaWindow;
