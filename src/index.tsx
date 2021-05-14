import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './frontend/assets/main.css';
import './frontend/assets/custom.css';
import store from './frontend/redux/store';
import Root from './frontend/Root';
import hookIpc from './frontend/ipc/listeners';

// TODO make CI take package.json version
hookIpc();

render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
