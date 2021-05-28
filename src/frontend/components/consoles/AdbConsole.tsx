import { ADB_LINK, ADB_TS_LINK } from '../../../links';

import Console from '../Console';
import React from 'react';
import { typedIpcRenderer as ipc } from '../../../rpc';

const AdbConsole = (props: { onExit?: VoidFunction }) => {
  return (
    <Console
      serial={'adb'}
      exec={(_, cmd) => ipc.invoke('execAdb', cmd)}
      openShell={() => ipc.send('openAdb')}
      onExit={props.onExit}
      links={[ADB_LINK, ADB_TS_LINK]}
    />
  );
};

export default AdbConsole;
