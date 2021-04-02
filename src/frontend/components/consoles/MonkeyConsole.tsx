import React from 'react';
import { MONKEY_LINK } from '../../../links';
import { execMonkey } from '../../ipc/exec';
import { openAdbShell } from '../../ipc/send';
import Console from '../Console';

const MonkeyConsole = (props: { id: string; onExit?: VoidFunction }) => {
  const { id, onExit } = props;
  return (
    <Console
      id={id}
      tag={`${id}-monkey`}
      exec={(opt, cb) => {
        const { id, cmd } = opt;
        execMonkey(id, cmd, cb);
      }}
      openShell={openAdbShell}
      onExit={() => {
        execMonkey(id, 'quit');
        onExit?.();
      }}
      links={[MONKEY_LINK]}
    />
  );
};

export default MonkeyConsole;
