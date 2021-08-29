import { Col, Row } from 'react-flexbox-grid';
import React, { useState } from 'react';

import Input from './ResizeInput';
import { ItemMaker } from '../../../shared';
import Li from './Li';
import StyledValue from './StyledValue';

const SettableLi = <T extends unknown>(props: {
  item: [string, T];
  index: number;
  onSetValue?: (value: string) => void;
  itemMaker: ItemMaker<T>;
}) => {
  const {
    index,
    item,
    onSetValue,
    itemMaker: { createKey, createValue, delimiter, styleValue },
  } = props;
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');

  const onSet = (value: string) => {
    setActive(false);
    setValue('');
    onSetValue?.(value);
  };

  return (
    <Li
      index={index}
      onClick={() => {
        if (!active) {
          setActive(true);
          setValue(createValue ? `${createValue(item)}` : '');
        }
      }}
    >
      <Row
        onClick={() => setActive(false)}
        style={{ margin: 0 }}
        className="pl-1 whitespace-pre-wrap"
      >
        {createKey && <Col>{createKey(item)}</Col>}
        {createValue && delimiter && <Col>{delimiter}</Col>}
        {active && createValue && onSetValue ? (
          <Col className="font-mono ml-3">
            <Input
              onBlur={() => setActive(false)}
              textColor="black"
              onEscape={() => {
                setActive(false);
                setValue('');
              }}
              buttonText="Set"
              autofocus
              onEnter={onSet}
              initValue={`${value}`}
            />
          </Col>
        ) : (
          <Col>
            {createValue &&
              (styleValue
                ? StyledValue(createValue(item))
                : `${createValue(item)}`)}
          </Col>
        )}
      </Row>
    </Li>
  );
};

export default SettableLi;
