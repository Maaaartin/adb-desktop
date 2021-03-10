import React from 'react';
import { execAdb } from '../../ipc/exec';
import { openAdb } from '../../ipc/send';
import Console from '../Console';

const AdbConsole = (props: { onExit?: VoidFunction }) => {
  return (
    <Console
      id={'adb'}
      exec={(opt, cb) => {
        const { cmd } = opt;
        execAdb(cmd, cb);
      }}
      openShell={() => {
        openAdb();
      }}
      onExit={props.onExit}
    />
  );
};

export default AdbConsole;
