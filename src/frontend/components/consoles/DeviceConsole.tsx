import React from 'react';
import { execAdbDevice } from '../../ipc/exec';
import { openAdbShell } from '../../ipc/send';
import Console from '../Console';

const DeviceConsole = (props: { id: string; onExit?: VoidFunction }) => {
  const { id } = props;
  return (
    <Console
      id={id}
      exec={(opt, cb) => {
        const { id, cmd } = opt;
        execAdbDevice(id, cmd, cb);
      }}
      openShell={openAdbShell}
      onExit={props.onExit}
    />
  );
};

export default DeviceConsole;
