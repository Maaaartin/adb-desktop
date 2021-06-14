import 'react-perfect-scrollbar/dist/css/styles.css';
import './frontend/assets/custom.css';
import './frontend/assets/main.css';

import Notifications from 'react-notification-system-redux';
import { Provider } from 'react-redux';
import React from 'react';
import Root from './frontend/Root';
import hookIpc from './frontend/ipc/listeners';
import { render } from 'react-dom';
import store from './frontend/redux/store';
import { typedIpcRenderer } from './ipcIndex';

// TODO make CI take package.json version
hookIpc();
typedIpcRenderer.on('displayError', (e, err) => {
  store.dispatch(
    Notifications.error({
      title: 'Error',
      message: err?.message,
      position: 'tr',
    })
  );
});

render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
