import React, { DetailedHTMLProps, LiHTMLAttributes } from 'react';
import parseColor from 'parse-color';

const LiColors = [
  parseColor('rgb(168, 177, 189)'),
  parseColor('rgb(154, 159, 166)'),
];

const colorToRgb = (color: parseColor.Color, level?: number) => {
  const newColor = [...color.rgb];
  if (level != undefined) {
    newColor[2] = newColor[2] + level * 10;
  }
  return `rgb(${newColor.join(', ')})`;
};

const Li = (
  props: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> & {
    index: number;
    level?: number;
  }
) => {
  const { index, children, style, level } = props;
  return (
    <li
      {...props}
      key={index}
      style={{
        backgroundColor:
          index % 2 === 0
            ? colorToRgb(LiColors[0], level)
            : colorToRgb(LiColors[1], level),
        minHeight: '30px',
        ...style,
      }}
    >
      {children}
    </li>
  );
};

export default Li;
