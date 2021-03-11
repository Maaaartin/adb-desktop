import { TextField } from '@material-ui/core';
import React, { useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaTimes } from 'react-icons/fa';
import Li from './Li';
import StyledValue from './StyledValue';

// TODO make type file
const SettableLi = <T extends unknown>(props: {
  item: [string, T];
  index: number;
  onSetValue?: (value: string) => void;
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
    onSetValue,
    itemMaker: { createKey, createValue, delimiter, styleValue },
  } = props;
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Li
      index={index}
      onClick={() => {
        if (!active) {
          setActive(true);
          setValue(createValue?.(item) || '');
        }
      }}
    >
      <Row style={{ margin: 0 }} className="pl-1 whitespace-pre-wrap">
        {createKey && <Col>{createKey(item)}</Col>}
        {createValue && delimiter && <Col>{delimiter}</Col>}
        {active && createValue && onSetValue ? (
          <>
            <Col className="ml-2 font-mono">
              <TextField
                style={{ height: '10px' }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActive(false);
                    setValue('');
                    onSetValue(value);
                  } else if (e.key === 'Escape') {
                    setActive(false);
                    setValue('');
                  }
                }}
                type="text"
              />
            </Col>
            <Col>
              <FaTimes
                className="cursor-pointer"
                onClick={() => setActive(false)}
              />
            </Col>
          </>
        ) : (
          <Col>
            {createValue &&
              (styleValue
                ? StyledValue(createValue?.(item))
                : createValue?.(item))}
          </Col>
        )}
      </Row>
    </Li>
  );
};

export default SettableLi;
