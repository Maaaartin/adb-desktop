import { Button, IconButton } from '@material-ui/core';
import { HTMLAttributes } from 'enzyme';
import React, { DetailedHTMLProps } from 'react';
import { FaChevronDown } from 'react-icons/fa';

type Props = {
  tag?: string;
  open: boolean;
  btnTag?: string;
  btnOnClick?: VoidFunction;
} & DetailedHTMLProps<HTMLAttributes, any>;

const CollapseButton = (props: Props) => {
  const { style, className, tag, onClick, open, btnOnClick, btnTag } = props;
  return (
    <div style={style} className={className}>
      <span className="p-4">{tag}</span>
      <IconButton onClick={onClick}>
        <FaChevronDown
          size="15"
          style={open ? { transform: 'rotate(180deg)' } : {}}
        />
      </IconButton>
      {btnTag && <Button onClick={btnOnClick}>{btnTag}</Button>}
    </div>
  );
};

export default CollapseButton;
