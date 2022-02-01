import { EMULATOR_LINK, EMULATOR_TS_LINK } from '../../../links';
import Console from '../Console';
import React from 'react';
import { typedIpcRenderer as ipc } from '../../../ipcIndex';

const EmulatorConsole = (props: { id: string; onExit?: VoidFunction }) => {
  const { id, onExit } = props;
  return (
    <Console
      serial={id}
      tag={`${id}-emul`}
      exec={(_, cmd) => ipc.invoke('execEmulator', id, cmd)}
      openShell={() => ipc.send('openEmulator', id)}
      onExit={onExit}
      links={[EMULATOR_LINK, EMULATOR_TS_LINK]}
    />
  );
};

export default EmulatorConsole;
