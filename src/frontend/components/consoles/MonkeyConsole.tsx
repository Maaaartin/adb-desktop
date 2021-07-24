import Console from '../Console';
import { MONKEY_LINK } from '../../../links';
import React from 'react';
import { typedIpcRenderer as ipc } from '../../../ipcIndex';

const MonkeyConsole = (props: { id: string; onExit?: VoidFunction }) => {
  const { id, onExit } = props;
  return (
    <Console
      serial={id}
      tag={`${id}-monkey`}
      exec={(_, cmd) => ipc.invoke('execMonkey', id, cmd)}
      openShell={() => ipc.send('openAdbShell', id)}
      onExit={() => {
        ipc.invoke('execMonkey', id, 'quit').catch(() => {});
        onExit?.();
      }}
      links={[MONKEY_LINK]}
    />
  );
};

export default MonkeyConsole;
