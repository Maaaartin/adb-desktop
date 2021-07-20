import React from 'react';
import { ADB_LINK, ADB_TS_LINK } from '../../../links';
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
      links={[ADB_LINK, ADB_TS_LINK]}
    />
  );
};

export default AdbConsole;
