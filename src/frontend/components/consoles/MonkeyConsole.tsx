import React from 'react';
import { execMonkey } from '../../ipc/exec';
import { openAdbShell } from '../../ipc/send';
import Console from '../Console';

const MonkeyConsole = (props: { id: string; onExit?: VoidFunction }) => {
  const { id } = props;
  return (
    <Console
      id={id}
      tag={`${id}-monkey`}
      exec={(opt, cb) => {
        const { id, cmd } = opt;
        execMonkey(id, cmd, cb);
      }}
      openShell={openAdbShell}
      onExit={props.onExit}
    />
  );
};

export default MonkeyConsole;
