import { Col, Row } from 'react-flexbox-grid';
import React, { useState } from 'react';

import HiddenInput from './HiddenInput';
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
          <Col className="font-mono">
            <HiddenInput
              buttonText="Set"
              onBtnClick={onSet}
              textColor="black"
              markedColor="white"
              initValue={`${value}`}
              onEnter={onSet}
              onEscape={() => {
                setActive(false);
                setValue('');
              }}
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
