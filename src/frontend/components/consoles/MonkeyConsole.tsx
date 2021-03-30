import React from 'react';
import { MONKEY_LINK } from '../../../links';
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
      links={[MONKEY_LINK]}
    />
  );
};

export default MonkeyConsole;
