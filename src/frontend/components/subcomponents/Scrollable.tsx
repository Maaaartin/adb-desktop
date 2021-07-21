import React, * as react from 'react';
import Scroll, { ScrollBarProps } from 'react-perfect-scrollbar';
import { get as getProp, set as setProp } from 'lodash';

const Scrollable = (
  props: ScrollBarProps & { ref?: react.LegacyRef<Scroll> }
) => {
  let lastY: string | null = null;
  let lastX: string | null = null;
  return (
    <Scroll
      onScrollLeft={() => {
        if (lastX) {
          lastX = null;
        }
      }}
      onXReachEnd={(c) => {
        if (!lastX) {
          lastX = getProp(
            c.children[c.children.length - 2],
            'style.left',
            null
          );
        }
      }}
      onScrollRight={(c) => {
        if (lastX) {
          setProp(c.children[c.children.length - 2], 'style.left', lastX);
        }
      }}
      onScrollUp={() => {
        if (lastY) {
          lastY = null;
        }
      }}
      onYReachEnd={(c) => {
        if (!lastY) {
          lastY = getProp(c, 'lastChild.style.top', null);
        }
      }}
      onScrollDown={(c) => {
        if (lastY) {
          setProp(c, 'lastChild.style.top', lastY);
        }
      }}
      {...props}
    >
      {props.children}
    </Scroll>
  );
};

export default Scrollable;
