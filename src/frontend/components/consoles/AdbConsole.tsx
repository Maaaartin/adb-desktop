import React from 'react';
import { execAdb, openAdb } from '../../ipc';
import Console from '../Console';

const AdbConsole = (props: { onExit?: VoidFunction }) => {
  return <Console id={'adb'}
    exec={(opt, cb) => {
      const { cmd } = opt;
      execAdb(cmd, cb);
    }}
    openShell={() => {
      openAdb();
    }}
    onExit={props.onExit}
  />;
}

export default AdbConsole;
