import React, { DetailedHTMLProps, LiHTMLAttributes } from 'react';

const Li = (
  props: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> & {
    index: number;
  }
) => {
  const { index, children, style } = props;
  return (
    <li
      {...props}
      key={index}
      style={{
        backgroundColor: index % 2 === 0 ? '#8f97a1' : '#9a9fa6',
        minHeight: '30px',
        ...style,
      }}
    >
      {children}
    </li>
  );
};

export default Li;
