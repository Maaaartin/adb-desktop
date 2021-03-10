import React from 'react';
import { execEmulator } from '../../ipc/exec';
import { openEmulator } from '../../ipc/send';
import Console from '../Console';

const EmulatorConsole = (props: { id: string; onExit?: VoidFunction }) => {
  const { id, onExit } = props;
  return (
    <Console
      id={id}
      tag={`${id}-emul`}
      exec={(opt, cb) => {
        const { cmd, id } = opt;
        execEmulator(id, cmd, cb);
      }}
      openShell={() => {
        openEmulator(id);
      }}
      onExit={onExit}
    />
  );
};

export default EmulatorConsole;
