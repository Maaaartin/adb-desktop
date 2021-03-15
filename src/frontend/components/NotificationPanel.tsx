import {
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuList,
  Typography,
} from '@material-ui/core';
import Notifications, {
  error as notifError,
  info as notifInfo,
} from 'react-notification-system-redux';
import { ipcRenderer as ipc } from 'electron';
import { get as getProp, isEmpty as emp } from 'lodash';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { FaAndroid, FaCog, FaTerminal } from 'react-icons/fa';
import { connect, ConnectedProps } from 'react-redux';
import {
  deviceAdd,
  deviceChange,
  loadAdbSettings,
  loadConsoleSettings,
  loadToken,
  setAdbStatus,
  Tab,
  tabAdd,
  tabDel,
  writeConsoleSettings,
} from '../redux/actions';
import {
  ADB_SETTINGS_LOAD,
  ADB_STATUS,
  DEVICE_CHANGE,
  LOAD_CONSOLE_SETTINGS,
  LOAD_TOKEN,
} from '../redux/actionTypes';
import { GlobalState } from '../redux/reducers';

class NotificationPanel extends Component {
  componentDidUpdate(prevProps, prevState) {
    console.log(this.props);
  }
  render() {
    return <div></div>;
  }
}
const mapStateToProps = (state: GlobalState) => {
  return {
    adb: state.adb.status,
    notifications: state.notifications,
  };
};

const mapDispatchToProps = {
  deviceAdd,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsRedux = ConnectedProps<typeof connector>;

export default connector(NotificationPanel);
