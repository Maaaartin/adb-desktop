import { Chip, IconButton } from '@material-ui/core';
import React, { MouseEventHandler, useState } from 'react';
import { IconType } from 'react-icons/lib/esm/iconBase';

const IconBtn = (props: {
  IconEl: IconType;
  tag: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) => {
  const { IconEl, onClick, tag, className } = props;
  const [hover, setHover] = useState(false);
  return (
    <div className={`relative${className ? ` ${className}` : ''}`}>
      <IconButton
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={() => {
          if (!hover) setHover(true);
        }}
      >
        <IconEl size="25"></IconEl>
      </IconButton>
      <Chip
        className="absolute"
        style={{
          bottom: '35px',
          left: '0',
          display: !hover ? 'none' : '',
        }}
        label={tag}
      />
    </div>
  );
};

export default IconBtn;
