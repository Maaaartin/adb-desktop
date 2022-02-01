import { Col, Row } from 'react-flexbox-grid';
import { ConnectedProps, connect } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@material-ui/core';
import ContentEditable from 'react-contenteditable';
import { FocusEventHandler } from 'react';
import { GlobalState } from '../../redux/reducers';
import Keyboard from 'keyboard-key';

type ResizeInputProps = {
  tag?: JSX.Element;
  onEnter?: (value: string) => void;
  onEscape?: (value: string) => void;
  disabled?: boolean;
  initValue?: string;
  withHistory?: boolean;
  autofocus?: boolean;
  textColor?: string;
  buttonText?: string;
  onBtnClick?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLDivElement>;
};

const ResizeInput = ({
  tag,
  disabled,
  initValue,
  onEnter,
  onEscape,
  withHistory,
  history,
  autofocus,
  textColor,
  buttonText,
  onBtnClick,
  onBlur,
}: ResizeInputProps & PropsRedux) => {
  const [value, setValue] = useState(initValue || '');
  const [offset, setOffset] = useState(0);
  const refTag = useRef<HTMLDivElement>(null);
  const refContent = useRef<HTMLDivElement>(null);
  // needs to be wrapped in useEffect, otherwise the offset is not rendered on first render
  useEffect(() => {
    setOffset(refTag.current?.offsetWidth || 0);
    if (autofocus) {
      refContent.current?.scrollIntoView();
      refContent.current?.focus();
    }
  });
  useEffect(() => {
    if (autofocus) {
      refContent.current?.focus();
    }
  }, []);
  return (
    <Row className="cursor-text">
      <Col>
        {tag && (
          <div
            ref={refTag}
            className="absolute"
            style={{
              marginTop: '1.5px',
              marginLeft: '10px',
            }}
          >
            {tag}
          </div>
        )}
        <ContentEditable
          innerRef={refContent}
          className={'outline-none border-none cursor-default break-all pr-3'}
          onBlur={onBlur}
          onKeyDown={(e) => {
            const key = Keyboard.getCode(e);
            if (key === Keyboard.Enter) {
              e.preventDefault();
              // need to use value from target
              onEnter?.(e.currentTarget.textContent || '');
              setValue('');
            } else if (key === Keyboard.Escape) {
              onEscape?.(e.currentTarget.textContent || '');
            }
            if (withHistory) {
              if (key === Keyboard.ArrowDown) {
                e.preventDefault();
                const index = history.indexOf(value);
                setValue(index > 0 ? history.get(index + 1, '') : '');
              } else if (key === Keyboard.ArrowUp) {
                e.preventDefault();
                const index = history.indexOf(value);
                setValue(
                  index > 0
                    ? history.get(index - 1, history.last())
                    : history.last()
                );
              }
            }
          }}
          style={{ marginLeft: `${offset + 10}px`, color: textColor || '' }}
          html={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
        />
      </Col>

      {buttonText && (
        <Col>
          <Button
            style={{ maxHeight: '25px' }}
            onClick={() => onBtnClick?.(value)}
          >
            {buttonText}
          </Button>
        </Col>
      )}
    </Row>
  );
};

const mapStateToProps = (state: GlobalState) => {
  return {
    history: state.console.get('history'),
  };
};

const connector = connect(mapStateToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(ResizeInput);
