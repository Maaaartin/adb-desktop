import Scroll, { ScrollBarProps } from 'react-perfect-scrollbar';
import { get as getProp, set as setProp } from 'lodash';

import React from 'react';

const Scrollable = (props: ScrollBarProps) => {
  let lastY: string | null = null;
  let lastX: string | null = null;
  const dummyRef = React.createRef<Scroll>();
  return (
    <Scroll
      ref={dummyRef}
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
      {...{ ...props, children: <div></div> }}
    >
      {props.children || <div></div>}
    </Scroll>
  );
};

export default Scrollable;
