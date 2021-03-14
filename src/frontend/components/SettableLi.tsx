import React, { useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { ItemMaker } from '../types';
import HiddenInput from './HiddenInput';
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
      <Row style={{ margin: 0 }} className="pl-1 whitespace-pre-wrap">
        {createKey && <Col>{createKey(item)}</Col>}
        {createValue && delimiter && <Col>{delimiter}</Col>}
        {active && createValue && onSetValue ? (
          <>
            <Col className="ml-2 font-mono">
              <HiddenInput
                markedColor="black"
                initValue={`${value}`}
                onEnter={(value) => {
                  setActive(false);
                  setValue('');
                  onSetValue(value);
                }}
                onEscape={() => {
                  setActive(false);
                  setValue('');
                }}
              />
            </Col>
          </>
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
