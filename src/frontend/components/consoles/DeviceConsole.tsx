import { ADB_LINK, ADB_TS_LINK } from '../../../links';

import Console from '../Console';
import React from 'react';
import { typedIpcRenderer as ipc } from '../../../ipcIndex';

const DeviceConsole = (props: { id: string; onExit?: VoidFunction }) => {
  const { id } = props;
  return (
    <Console
      serial={id}
      exec={(_, cmd) => ipc.invoke('execDevice', id, cmd)}
      openShell={() => ipc.send('openAdbShell', id)}
      onExit={props.onExit}
      links={[ADB_LINK, ADB_TS_LINK]}
    />
  );
};

export default DeviceConsole;
