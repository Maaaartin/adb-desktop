import { HTMLAttributes } from 'enzyme';
import React, { DetailedHTMLProps } from 'react';
import { getColor } from '../../colors';

const Scrollable: React.FunctionComponent<any> = (
  props: DetailedHTMLProps<HTMLAttributes, any>
) => {
  const { style, className, children } = props;
  return (
    <div
      className={`relative${className ? ` ${className}` : ''}`}
      style={{ ...style, width: 'calc(100% + 17px)' }}
    >
      <div
        className="absolute h-full right-0"
        style={{ backgroundColor: getColor('bg'), width: '17px' }}
      />
      {children}
    </div>
  );
};

export default Scrollable;
