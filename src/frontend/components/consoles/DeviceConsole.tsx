import React from 'react';
import { execAdbDevice, openAdbShell } from '../../ipc';
import Console from '../Console';

const DeviceConsole = (props: { id: string, onExit?: VoidFunction }) => {
  const { id } = props;
  return <Console id={id}
    exec={(opt, cb) => {
      const { id, cmd } = opt;
      execAdbDevice(id, cmd, cb);
    }}
    openShell={openAdbShell}
    onExit={props.onExit}
  />;
}

export default DeviceConsole;
