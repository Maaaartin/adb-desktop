import React from 'react';

const StyledValue = (value: any) => {
  let color: string = '';
  switch (typeof value) {
    case 'string':
      color = '#b55c09';
      break;
    case 'number':
      color = '#548208';
      break;
    default:
      color = '#358bd6';
      break;
  }

  return (
    <span style={{ color }} className="font-mono">
      {`${value}`}
    </span>
  );
};

export default StyledValue;
