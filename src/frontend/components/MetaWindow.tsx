import { TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Dictionary, isEmpty as emp } from 'lodash';
import React, { ReactElement, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaSync } from 'react-icons/fa';
import IconBtn from './IconBtn';
import Scrollable from './Scrollable';
import StyledValue from './StyledValue';
// TODO make type file
const SettableLi = <T extends unknown>(props: {
  item: [string, T];
  index: number;
  itemMaker: {
    createKey?: (item: [string, T]) => string;
    createValue?: (item: [string, T]) => string;
    delimiter?: string;
    styleValue?: boolean;
  };
}) => {
  const {
    index,
    item,
    itemMaker: { createKey, createValue, delimiter, styleValue },
  } = props;
  const [change, setChange] = useState(false);
  return (
    <li
      onClick={() => setChange(true)}
      key={index}
      style={{
        backgroundColor: index % 2 === 0 ? '#8f97a1' : '#9a9fa6',
      }}
    >
      {[
        createKey?.(item),
        delimiter,
        change ? (
          <input
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setChange(false);
              }
            }}
            type="text"
          />
        ) : (
          createValue &&
          (styleValue ? StyledValue(createValue?.(item)) : createValue?.(item))
        ),
      ]}
    </li>
  );
};

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
  };
};

const MetaWindow: <T>(props: Props<T>) => ReactElement = (props) => {
  const { getter, onSearch, valueToString, tag, serial, itemMaker } = props;
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
              <SettableLi index={index} item={item} itemMaker={itemMaker} />
            );
          })}
        </ul>
      </Scrollable>
    </div>
  );
};

export default MetaWindow;
