import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaSync } from 'react-icons/fa';
import IconBtn from './IconBtn';

const RefreshSearch = (props: {
  search: string;
  collection: string[];
  onRefrestClick?: VoidFunction;
  onSearchChange?: (value: string) => void;
}) => {
  const { search, collection, onRefrestClick, onSearchChange } = props;
  return (
    <Row end="xs">
      <Col>
        <IconBtn
          tag="Refresh"
          IconEl={FaSync}
          onClick={() => onRefrestClick?.()}
        />
      </Col>
      <Col>
        <Autocomplete
          style={{ width: '300px' }}
          options={collection}
          onSelect={(e) => onSearchChange?.((e.target as any).value)}
          renderInput={(params) => (
            <TextField
              {...params}
              value={search}
              onChange={(e) => onSearchChange?.((e.target as any).value)}
              label="Search"
              variant="standard"
            />
          )}
        />
      </Col>
    </Row>
  );
};

export default RefreshSearch;
