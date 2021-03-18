import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import './frontend/assets/custom.css';
import './frontend/assets/main.css';
import store from './frontend/redux/store';
import Root from './frontend/Root';
import hookIpc from './frontend/ipc/listeners';

hookIpc();

// TODO fix emulator token reading
// TODO display script errors
render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
